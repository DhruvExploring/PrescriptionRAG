import cohere 
import pandas as pd
import dotenv
import os


dotenv.load_dotenv()

def Reranking(documents, query,k):

    if os.getenv("COHERE_API_KEY") is None:
        print("cohere_api not found in environment variables")
        return None
    co = cohere.ClientV2(os.getenv("COHERE_API_KEY"))
    results= co.rerank(
        model="rerank-v4.0-pro",
        query=query,
        documents=documents,
        top_n=k
    )
    return results.results

if __name__=="__main__":
    co = cohere.ClientV2(
        os.getenv("cohere_api")
    )

    documents= pd.read_json("embedded_chunks.json")["text"].tolist()
    query=input("Enter your query: ")

    print(Reranking(documents, query, 4))

    results=Reranking(documents, query, 4)

    for i in results:
        index=i.index
        print(documents[index])
        print("\n")