import ollama
from sklearn.metrics.pairwise import cosine_similarity
import json
import pandas as pd
import numpy as np
import dotenv
dotenv.load_dotenv()
data=pd.read_json("embedded_chunks.json")
query=input("Enter your query: ")
response=ollama.embed(model="bge-m3", input=query)
query_embedding=response["embeddings"][0]
embeddings=np.array(query_embedding).reshape(1,-1)
top_results=cosine_similarity(np.vstack(data["embedding"]),embeddings).reshape(1,-1)
top_results=np.argsort(top_results)[0][::-1][:4]

relevant_data=data.iloc[top_results][["page_number", "text"]]

report=json.load(open("report.json", "r"))

query=f" The user has asked the following question: {query} and the following chunks are relevant to the question: {relevant_data}. The user has also attached a report {report}. Answer the question based on the chunks in a way that you are a doctor and explaining with context of the book.give all the explanation in one go and do not end with any followup questions. also mention the page numbers in the end where i can find the information. act like you are a doctor and the text is your knowlege in the subject"
from google import genai

client = genai.Client()

response = client.models.generate_content(
    model="gemini-3-flash-preview",
    contents=query,
)

print(response.text)
