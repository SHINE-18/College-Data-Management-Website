// ============================================
// pages/HODReports.jsx — HOD Analytics Reports
// ============================================

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

const REPORT_TYPES = [
    { key: 'attendance', label: 'Attendance Report', icon: '✅', desc: 'Subject-wise attendance percentages' },
    { key: 'results', label: 'Results Report', icon: '📊', desc: 'Marks and pass rates per subject' },
    { key: 'faculty-workload', label: 'Faculty Workload', icon: '👩‍🏫', desc: 'Teaching hours and subject assignment' },
];

const HODReports = () => {
    const { user } = useAuth();
    const [activeReport, setActiveReport] = useState('attendance');
    const [semester, setSemester] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    const fetchReport = async () => {
        setLoading(true); setError(''); setData(null);
        try {
            const params = new URLSearchParams();
            if (user?.department) params.append('department', user.department);
            if (semester && activeReport !== 'faculty-workload') params.append('semester', semester);
            const { data: res } = await api.get(`/reports/${activeReport}?${params}`);
            setData(res);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to generate report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderTable = () => {
        if (!data?.summary || data.summary.length === 0) return <p className="text-center py-8 text-gray-400">No data available.</p>;

        if (activeReport === 'attendance') {
            return (
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Subject</th>
                            <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Attended</th>
                            <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Total</th>
                            <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">%</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {data.summary.map((row, i) => (
                            <tr key={i}>
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.subject}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{row.attended}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{row.total}</td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`font-semibold ${row.percentage >= 75 ? 'text-green-600' : row.percentage >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                                        {row.percentage}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        if (activeReport === 'results') {
            return (
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Subject</th>
                            <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Students</th>
                            <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Avg Marks</th>
                            <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Highest</th>
                            <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Pass Rate</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {data.summary.map((row, i) => (
                            <tr key={i}>
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.subject}</td>
                                <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{row.studentCount}</td>
                                <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400 font-medium">{row.avgMarks}</td>
                                <td className="px-4 py-3 text-right text-purple-600 dark:text-purple-400 font-medium">{row.highestMarks}</td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`font-semibold ${row.passRate >= 75 ? 'text-green-600' : 'text-amber-500'}`}>
                                        {row.passRate}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        if (activeReport === 'faculty-workload') {
            return (
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Designation</th>
                            <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Subjects</th>
                            <th className="px-4 py-2 text-right text-xs text-gray-500 uppercase">Hours</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {data.summary.map((row, i) => (
                            <tr key={i}>
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{row.name}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.designation}</td>
                                <td className="px-4 py-3 text-right text-blue-600">{row.subjects}</td>
                                <td className="px-4 py-3 text-right text-purple-600 font-medium">{row.totalHours}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">HOD Reports</h1>
            <p className="text-sm text-gray-500 mb-6">Department: <strong>{user?.department || 'Your Department'}</strong></p>

            {/* Report type selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {REPORT_TYPES.map(r => (
                    <button
                        key={r.key}
                        onClick={() => { setActiveReport(r.key); setData(null); }}
                        className={`border-2 rounded-xl p-4 text-left transition ${activeReport === r.key ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}
                    >
                        <div className="text-2xl mb-1">{r.icon}</div>
                        <div className="font-semibold text-sm text-gray-900 dark:text-white">{r.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{r.desc}</div>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 mb-6">
                <div className="flex flex-wrap items-end gap-4">
                    {activeReport !== 'faculty-workload' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Semester</label>
                            <select value={semester} onChange={e => setSemester(e.target.value)}
                                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="">All Semesters</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}
                    <button onClick={fetchReport} disabled={loading}
                        className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition disabled:opacity-60">
                        {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                </div>
            </div>

            {/* Results table */}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {data && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {REPORT_TYPES.find(r => r.key === activeReport)?.label}
                            {data.semester ? ` — Semester ${data.semester}` : ''}
                        </h2>
                        <span className="text-xs text-gray-400">{data.summary?.length || 0} entries</span>
                    </div>
                    <div className="overflow-x-auto">{renderTable()}</div>
                </div>
            )}
        </div>
    );
};

export default HODReports;
