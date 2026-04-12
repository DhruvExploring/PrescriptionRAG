import csv
import os
from datetime import datetime
from typing import List, Dict

# Store feedback in the root data directory
FEEDBACK_FILE = "data/feedback.csv"

def save_feedback(helpful: bool, comments: str):
    # Ensure the directory exists
    os.makedirs(os.path.dirname(FEEDBACK_FILE), exist_ok=True)
    
    file_exists = os.path.isfile(FEEDBACK_FILE)
    
    with open(FEEDBACK_FILE, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(['timestamp', 'helpful', 'comments'])
        
        writer.writerow([datetime.now().isoformat(), helpful, comments])

def get_all_feedback() -> List[Dict]:
    if not os.path.isfile(FEEDBACK_FILE):
        return []
    
    feedbacks = []
    with open(FEEDBACK_FILE, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            feedbacks.append(row)
    
    return feedbacks

def get_feedback_file_path() -> str:
    return os.path.abspath(FEEDBACK_FILE)
