import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { FaDownload, FaFileAlt } from 'react-icons/fa';

const GradesViewer = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const { data } = await api.get('/student/results');
                setResults(data);
            } catch (error) {
                console.error("Failed to load results", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, []);

    if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>;

    // Group results by Semester
    const groupedBySem = results.reduce((acc, curr) => {
        if (!acc[curr.semester]) acc[curr.semester] = [];
        acc[curr.semester].push(curr);
        return acc;
    }, {});

    const sortedSems = Object.keys(groupedBySem).sort((a, b) => b - a); // Newest first

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Academic Results</h1>
                    <p className="text-gray-500 text-sm mt-1">View your grades across all semesters and exams.</p>
                </div>
                <button className="flex items-center space-x-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition">
                    <FaDownload /> <span>Download Transcript</span>
                </button>
            </div>

            {sortedSems.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
                    <FaFileAlt className="text-4xl mx-auto mb-4 text-gray-200" />
                    <p>No results published yet.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedSems.map(sem => (
                        <div key={sem} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                                <h2 className="text-lg font-bold text-primary">Semester {sem}</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50 text-gray-500 text-xs font-medium uppercase tracking-wider border-b border-gray-100">
                                            <th className="p-4">Subject</th>
                                            <th className="p-4">Exam Type</th>
                                            <th className="p-4 text-right">Marks Obtained</th>
                                            <th className="p-4 text-right">Total Marks</th>
                                            <th className="p-4 text-right">Percentage</th>
                                            <th className="p-4">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {groupedBySem[sem].map((result, idx) => {
                                            const percentage = ((result.marksObtained / result.totalMarks) * 100).toFixed(1);
                                            const isPassing = percentage >= 35; // Example passing mark

                                            return (
                                                <tr key={idx} className="hover:bg-blue-50/20 transition">
                                                    <td className="p-4 font-medium text-gray-900 text-sm">{result.subject}</td>
                                                    <td className="p-4 text-gray-500 text-sm shrink-0">
                                                        <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs">
                                                            {result.examType}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right font-bold text-gray-900 shrink-0">{result.marksObtained}</td>
                                                    <td className="p-4 text-right text-gray-500 text-sm shrink-0">{result.totalMarks}</td>
                                                    <td className="p-4 text-right shrink-0">
                                                        <span className={`px-2 py-1 text-xs font-bold rounded ${isPassing ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {percentage}%
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-500 italic truncate max-w-[150px]">{result.remarks || '-'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GradesViewer;
