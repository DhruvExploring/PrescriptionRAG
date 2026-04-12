from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import shutil
import os
import json
import redis
import uuid
from .logic import extract_and_parse_report, generate_diagnosis
from .feedback import save_feedback, get_all_feedback, get_feedback_file_path
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import Histogram


Total_request_time_seconds = Histogram(
    "Total_request_time_seconds",
    "Time spent processing the request"
)
read_file_bytes_seconds = Histogram(
    "read_file_bytes_seconds",
    "Time spent reading uploaded file bytes"
)

extract_parse_report_seconds = Histogram(
    "extract_parse_report_seconds",
    "Time spent extracting and parsing report data"
)

llm_analysis_seconds = Histogram(
    "llm_analysis_seconds",
    "Time spent getting analysis from the LLM API"
)
app = FastAPI()

Instrumentator().instrument(app).expose(app)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisResponse(BaseModel):
    diagnosis: str
    extracted_data: list

class FeedbackRequest(BaseModel):
    helpful: bool
    comments: str = ""

class LoginRequest(BaseModel):
    password: str

# Initialize Redis
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
try:
    redis_client = redis.Redis.from_url(redis_url, decode_responses=True)
except Exception as e:
    print(f"Failed to connect to Redis: {e}")
    redis_client = None

def verify_redis_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = auth_header.split(" ")[1]
    
    if not redis_client:
        raise HTTPException(status_code=500, detail="Redis connection unavailable")

    if not redis_client.exists(f"session:{token}"):
        raise HTTPException(status_code=401, detail="Invalid or expired session token")
    
    return token

@app.post("/admin/login")
def admin_login(req: LoginRequest):
    admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
    if req.password != admin_password:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    if not redis_client:
        raise HTTPException(status_code=500, detail="Redis connection unavailable")
        
    token = str(uuid.uuid4())
    # Store token in Redis with 24 hours expiration
    redis_client.setex(f"session:{token}", 86400, "active")
    
    return {"token": token}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_symptoms(
    file: UploadFile = File(...),
    symptoms: str = Form(...)
):
    with Total_request_time_seconds.time():
        try:

            with read_file_bytes_seconds.time():
                file_bytes = await file.read()

           
            with extract_parse_report_seconds.time():    
                report_data, full_text = extract_and_parse_report(file_bytes)

            with llm_analysis_seconds.time():
                diagnosis = generate_diagnosis(symptoms, report_data, full_text)

            return AnalysisResponse(
                diagnosis=diagnosis,
                extracted_data=report_data
            )

        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
@app.get("/")
def read_root():
    return {"message": "PrescriptionRAG Backend is running"}

@app.post("/feedback")
def submit_feedback(feedback: FeedbackRequest):
    try:
        save_feedback(feedback.helpful, feedback.comments)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/feedback")
def get_feedback_route(token: str = Depends(verify_redis_token)):
    try:
        return get_all_feedback()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/feedback/download")
def download_feedback_route(token: str = Depends(verify_redis_token)):
    file_path = get_feedback_file_path()
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="No feedback data found")
    return FileResponse(file_path, filename="feedback.csv", media_type="text/csv")
