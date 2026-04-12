from backend.logic import generate_diagnosis
from backend.reranking import Reranking
from backend.json_to_qdrant import create_qdrant_database
import cohere 
import pandas as pd


print(generate_diagnosis("i have pain in my stomach",[],""))