import React, { useState } from 'react';
import axios from 'axios';
import UploadForm from './components/UploadForm';
import DiagnosisDisplay from './components/DiagnosisDisplay';
import AdminPanel from './components/AdminPanel';
import { HeartPulse } from 'lucide-react';

function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (file, symptoms) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else {
      const emptyFile = new File([""], "empty.pdf", { type: "application/pdf" });
      formData.append('file', emptyFile);
    }
    formData.append('symptoms', symptoms || "No symptoms provided");

    try {
      const response = await axios.post('http://13.127.86.204:8000/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
    } catch (err) {
      console.error("Error analyzing:", err);
      setError("Failed to analyze data. Please make sure the backend is running and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (window.location.pathname === '/admin') {
    return <AdminPanel />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              FreshApple
            </h1>
          </div>
          <div className="text-sm font-medium text-gray-500">
            AI-Powered Medical Assistant
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Intro Section */}
        {!result && !isLoading && (
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Understand Your Health Better
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Upload your medical reports and describe your symptoms. Our AI engine analyzes your data against trusted medical texts to provide you with a comprehensive explanation.
            </p>
          </div>
        )}

        {/* Upload Form */}
        <div className={`${result ? 'hidden' : 'block'}`}>
          <UploadForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setResult(null)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                ← Start New Analysis
              </button>
            </div>
            <DiagnosisDisplay result={result} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          &copy; 2026 FreshApple. All rights reserved. This is an AI assistant and not a substitute for professional medical advice.
        </div>
      </footer>
    </div>
  );
}

export default App;
