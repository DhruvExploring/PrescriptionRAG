import os
import json
import re
import numpy as np
import pandas as pd
from pdf2image import convert_from_bytes
import pytesseract
from sklearn.metrics.pairwise import cosine_similarity
from google import genai
import dotenv
import qdrant_client
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct
from qdrant_client.models import Distance, VectorParams
from .reranking import Reranking
import cohere 
from openai import OpenAI


client = QdrantClient(host="qdrant", port=6333)

dotenv.load_dotenv()
openai_client=OpenAI()


try:
    CHUNKS_DATA = pd.read_json("embedded_chunks.json")
except ValueError:
    print("Warning: embedded_chunks.json not found or invalid. RAG will not work correctly.")
    CHUNKS_DATA = pd.DataFrame()

def extract_and_parse_report(pdf_bytes: bytes):
    """
    Converts PDF bytes to images, extracts text via OCR, and parses medical report data.
    """
    try:
        pages = convert_from_bytes(pdf_bytes)
    except Exception as e:
        print(f"Error converting PDF: {e}")
        return [], ""

    full_text = ""
    for page in pages:
        full_text += pytesseract.image_to_string(page)

    # Regex pattern from report_parser.py
    pattern = r"""
    (?P<test>[A-Za-z][A-Za-z ():/]*?)     
    \s+
    (?P<value><?\d+(?:\.\d+)?)             
    \s+
    (?P<unit>[A-Za-z/]+)                   
    \s+
    (?P<ref>
        <\s*\d+(?:\.\d+)?                 
        |
        \d+(?:\.\d+)?\s*[–-]\s*\d+(?:\.\d+)? 
    )
    """
    
    matches = re.finditer(pattern, full_text, re.VERBOSE)
    parsed_data = []
    for m in matches:
        parsed_data.append(m.groupdict())
        
    return parsed_data, full_text

def check_database_availability():
    client = QdrantClient(host="qdrant", port=6333)
    collections=client.get_collections()
    if collections.collections==[]:
        try:
            from .json_to_qdrant import create_qdrant_database
            create_qdrant_database()
            return True
        except Exception as e:
            print(f"Error creating database: {e}")
            return False
    else:
        print(collections.collections)
        return True



def generate_diagnosis(symptoms: str, report_data: list, full_report_text: str):
    """
    Generates a diagnosis using RAG + Gemini based on symptoms and parsed report data.
    """
    print(type(os.getenv("COHERE_API_KEY")))

    client = QdrantClient(host="qdrant", port=6333)

    if check_database_availability():
        pass
    else:
        return "Error: Medical knowledge base not loaded."

    # Embed the query (symptoms)
    try:

        result = openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=symptoms,
                dimensions=1024
        )
        query_embedding = result.data[0].embedding
    except Exception as e:
        return f"Error embedding query: {e}"
    query_embedding=np.array(query_embedding).reshape(1024,1)

    query_embedding = np.asarray(query_embedding).astype(np.float32).flatten().tolist()

    print(client.get_collections())

    relevant_chunks=client.query_points(
    collection_name="medical_book",
    query=query_embedding,
    with_payload=True,
    limit=15
    ).points

    # print("qdrant output","\n",relevant_chunks)

    relevant_chunks_text=[]

    for i in relevant_chunks:
        relevant_chunks_text.append(i.payload["text"])

    relevant_chunks=Reranking(relevant_chunks_text, symptoms, 2)

    # print("reranking output","\n",relevant_chunks)


    formatted_chunks = [
    {
        "id": p.index,
        "score": p.relevance_score,
        "payload": relevant_chunks_text[p.index]
    }
    for p in relevant_chunks
    ]

    
    prompt = f"""
    You are an expert doctor. 
    
    Patient Symptoms: {symptoms}
    
    Patient Medical Report Data: {json.dumps(report_data, indent=2)}
    
    Relevant Medical Knowledge (from textbook):
    {json.dumps(formatted_chunks, indent=2)}
    
    Task:
    1. Analyze the patient's symptoms and their medical report values.
    2. Use the provided medical knowledge chunks to explain the condition or diagnosis.
    3. Provide a diagnosis in a clear, professional, and empathetic tone.
    4. Reference specific page numbers from the textbook chunks where you found the information in the end. 
    5. Do NOT end with follow-up questions. Give a comprehensive explanation.
    6. Give a clear explanation in bullet points followed by a paragraph explaining the diagnosis in detail. Highlight the summary in bold.
    
    Answer:
    """

    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=prompt,
        )
        return response.text

    
    except Exception as e:

        try:
            response = openai_client.responses.create(
                model="gpt-4o",
                input=prompt,
            )

            return response.output_text

            
        except Exception as e:
            return f"Error generating response from GPT: {e}"
