import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, LogOut, Download, AlertCircle } from 'lucide-react';

const AdminPanel = () => {
    const [token, setToken] = useState(sessionStorage.getItem('adminToken') || null);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [feedbackData, setFeedbackData] = useState([]);
    const [dataError, setDataError] = useState('');

    useEffect(() => {
        if (token) {
            fetchFeedbackData(token);
        }
    }, [token]);

    const fetchFeedbackData = async (currentToken) => {
        try {
            const response = await axios.get('http://localhost:8000/feedback', {
                headers: { Authorization: `Bearer ${currentToken}` }
            });
            setFeedbackData(response.data);
            setDataError('');
        } catch (err) {
            setDataError('Failed to load feedback data. Ensure backend is running.');
            console.error(err);
            if (err.response?.status === 401) {
                handleLogout(); // Token expired
            }
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError('');
        try {
            const res = await axios.post('http://localhost:8000/admin/login', { password });
            const receivedToken = res.data.token;
            setToken(receivedToken);
            sessionStorage.setItem('adminToken', receivedToken);
        } catch (err) {
            setAuthError('Invalid credentials or backend unavailable.');
        }
    };

    const handleLogout = () => {
        setToken(null);
        sessionStorage.removeItem('adminToken');
        setFeedbackData([]);
    };

    const handleDownload = async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:8000/feedback/download', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'feedback.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            setDataError('Failed to download CSV.');
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <div>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                            <Lock className="h-6 w-6 text-blue-600" />
                        </div>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Admin Login
                        </h2>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                        <div className="rounded-md shadow-sm">
                            <div>
                                <input
                                    type="password"
                                    required
                                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter Master Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {authError && (
                            <div className="text-red-500 text-sm text-center flex items-center justify-center gap-1">
                                <AlertCircle className="w-4 h-4" /> {authError}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Feedback Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-1">Logged in securely via Redis</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleDownload}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            <Download className="w-4 h-4" /> Download CSV
                        </button>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                </header>

                {dataError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-700">
                        {dataError}
                    </div>
                )}

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Helpful</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {feedbackData.length > 0 ? (
                                feedbackData.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(row.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {row.helpful === 'True' ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Yes</span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">No</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 break-words max-w-xl">
                                            {row.comments || <span className="text-gray-300 italic">No comments</span>}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                        No feedback found yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
