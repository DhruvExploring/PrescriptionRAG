# PrescriptionRAG

PrescriptionRAG is an AI-powered medical assistant designed to analyze user-uploaded medical reports and cross-reference them with established medical literature. By leveraging Retrieval-Augmented Generation (RAG) and large language models, it provides users with coherent, data-driven explanations of their symptoms and test results.

## System Architecture

The project is structured as a full-stack web application, entirely containerized via Docker for seamless deployment.

### Core Stack
- **Frontend**: React.js built with Vite, styled utilizing Tailwind CSS.
- **Backend API**: Python FastAPI.
- **Vector Database**: Qdrant, responsible for storing and retrieving embedded medical document chunks.
- **Language Models**: Integrated with Ollama for local model inference and external providers (Cohere, Google Gemini) for specialized tasks.
- **Session Management**: Redis Alpine, used to securely manage administration authentication tokens.
- **Monitoring**: Prometheus and Grafana for real-time application metrics.

## Key Features

- **Automated Data Extraction**: Extracts critical ranges, values, and testing parameters directly from uploaded diagnostic reports.
- **Contextual Diagnosis**: Uses RAG to find relevant medical literature based on the user's symptoms and provides a synthesized explanation.
- **Interactive Feedback Loop**: Features an automated, non-intrusive feedback prompt that records the helpfulness of the diagnosis to improve system accuracy.
- **Secure Admin Portal**: Includes an administration dashboard protected by token-based authentication (backed by Redis) to view and export user feedback analytics.
- **Real-time Monitoring**: Built-in endpoints and infrastructure to track system performance via Grafana histograms.

## Setup and Deployment

This application heavily relies on Docker Compose to orchestrate its microservices. Ensure you have Docker and Docker Compose installed on your host system.

### Prerequisites

You must define the necessary API keys and environment variables. Create a `.env` file in the root directory (refer to the provided structure below).

Required Environment Variables:
- `COHERE_API_KEY`: For embedding generation.
- `GEMINI_API_KEY`: For auxiliary LLM inference.
- `ADMIN_PASSWORD`: A secure password used to access the `/admin` feedback portal.

### Running the Application

1. Open a terminal in the root directory.
2. Build and start the containers in detached mode:
   `docker-compose up --build -d`
3. The services will bind to the following ports:
   - Frontend Application: `http://localhost:5173`
   - Backend API: `http://localhost:8000`
   - Grafana Dashboard: `http://localhost:3000`

## Important Configuration Notes

- The administration portal operates at `/admin` on the frontend. Login requires the password defined by the `ADMIN_PASSWORD` variable. Once authenticated, the session is securely issued and handled by the isolated Redis container.
- If you wish to adjust the feedback form's delay interval, you can modify the timeout parameter defined in `frontend/src/components/DiagnosisDisplay.jsx`.

## Security

Please ensure that you do not commit your `.env` files or any authentication keys (such as `.pem` files) to version control. These have been explicitly defined in the `.gitignore` configuration for your convenience.

---

**Author**: Dhruv Pandey
