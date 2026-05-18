import React, { useState } from 'react';
import { Upload, FileText, Activity, AlertCircle } from 'lucide-react';

const UploadForm = ({ onAnalyze, isLoading }) => {
    const [file, setFile] = useState(null);
    const [symptoms, setSymptoms] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (file || symptoms) {
            onAnalyze(file, symptoms);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Activity className="w-6 h-6" />
                    Symptom Analysis or Report Upload
                </h2>
                <p className="opacity-90 mt-2 text-sm">
                    Please upload your medical report or describe your symptoms for a comprehensive AI-assisted analysis.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6">
                {/* File Upload Section */}
                <div className="space-y-2">
                    <span className="block text-sm font-medium text-gray-700">Medical Report (PDF)</span>
                    <label 
                        htmlFor={!file ? "file-upload" : undefined}
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${!file ? 'cursor-pointer hover:border-blue-500 bg-gray-50 hover:bg-blue-50' : 'bg-gray-50'}`}
                    >
                        <div className="space-y-1 text-center w-full">
                            {file ? (
                                <div className="flex flex-col items-center text-blue-600">
                                    <FileText className="mx-auto h-12 w-12" />
                                    <p className="mt-2 text-sm font-medium">{file.name}</p>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFile(null);
                                        }}
                                        className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex justify-center text-sm text-gray-600">
                                        <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500">
                                            Upload a file
                                        </span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                                </>
                            )}
                        </div>
                    </label>
                </div>

                {/* Symptoms Section */}
                <div className="space-y-2">
                    <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">Describe Symptoms</label>
                    <textarea
                        id="symptoms"
                        rows={4}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
                        placeholder="E.g., I have had a persistent headache for 3 days and slight fever..."
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={(!file && !symptoms) || isLoading}
                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </span>
                        ) : 'Analyze Symptoms & Report'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UploadForm;
