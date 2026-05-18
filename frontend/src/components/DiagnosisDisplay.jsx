import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { Stethoscope, ClipboardList, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';

const DiagnosisDisplay = ({ result }) => {
    const [feedbackStep, setFeedbackStep] = useState(0);
    const [isHelpful, setIsHelpful] = useState(null);
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (result) {
            // Reset feedback state on new result
            setFeedbackStep(0);
            setIsHelpful(null);
            setComments('');

            // Show feedback form after 45 seconds
            const timer = setTimeout(() => {
                setFeedbackStep(1);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [result]);

    const handleThumbs = (helpful) => {
        setIsHelpful(helpful);
        setFeedbackStep(2);
    };

    const handleSubmitFeedback = async () => {
        setIsSubmitting(true);
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/feedback`, {
                helpful: isHelpful,
                comments: comments
            });
            setFeedbackStep(3);
        } catch (e) {
            console.error("Failed to submit feedback", e);
            // Optionally could still show step 3 or an error message
            setFeedbackStep(3);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        setFeedbackStep(3); // Just hide or go to done state without sending text
    };

    if (!result) return null;

    const { diagnosis, extracted_data } = result;

    return (
        <div className="space-y-8 animate-fade-in-up pb-12">
            {/* Diagnosis Section */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Stethoscope className="w-6 h-6" />
                        Diagnosis & Recommendations
                    </h2>
                </div>
                <div className="p-4 sm:p-8 prose prose-blue max-w-none" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                    <ReactMarkdown>{diagnosis}</ReactMarkdown>
                </div>
            </div>

            {/* Extracted Data Section (Collapsible or just listed) */}
            {extracted_data && extracted_data.length > 0 && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="bg-gray-50 p-4 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-blue-500" />
                            Extracted Report Data
                        </h3>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref Range</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {extracted_data.map((item, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.test}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.value}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{item.ref}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Feedback Section */}
            {feedbackStep > 0 && (
                <div className="mt-12 bg-white rounded-xl shadow-lg border border-blue-100 p-6 max-w-2xl mx-auto transition-all duration-500 ease-in-out">
                    {feedbackStep === 1 && (
                        <div className="text-center space-y-6 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-gray-800">Was this diagnosis helpful?</h3>
                            <div className="flex justify-center gap-6">
                                <button
                                    onClick={() => handleThumbs(true)}
                                    className="p-4 rounded-full border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 hover:text-green-600 transition-all text-gray-400 group"
                                >
                                    <ThumbsUp className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                    onClick={() => handleThumbs(false)}
                                    className="p-4 rounded-full border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all text-gray-400 group"
                                >
                                    <ThumbsDown className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    {feedbackStep === 2 && (
                        <div className="space-y-4 animate-fade-in-up">
                            <h3 className="text-lg font-bold text-gray-800">Any additional feedback? (Optional)</h3>
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] outline-none transition-all"
                                placeholder={isHelpful ? "What did you like about this analysis?" : "How could we improve this analysis?"}
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={handleSkip}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleSubmitFeedback}
                                    className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </div>
                    )}

                    {feedbackStep === 3 && (
                        <div className="text-center space-y-3 py-4 animate-fade-in-up text-green-600">
                            <CheckCircle2 className="w-12 h-12 mx-auto" />
                            <h3 className="text-lg font-bold">Thank you for your feedback!</h3>
                            <p className="text-sm text-gray-500">Your input helps us improve the platform.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DiagnosisDisplay;
