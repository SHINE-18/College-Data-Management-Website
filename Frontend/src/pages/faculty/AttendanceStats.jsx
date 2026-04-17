import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { FaChartBar, FaChartPie, FaTrendingUp, FaFilter } from 'react-icons/fa';

const AttendanceStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [semester, setSemester] = useState('1');
    const [dateRange, setDateRange] = useState('month'); // week, month, semester
    const [topAbsentStudents, setTopAbsentStudents] = useState([]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/faculty/portal/attendance/stats?semester=${semester}&range=${dateRange}`);
            setStats(response.data);
            
            // Fetch top absent students
            const absentResponse = await api.get(`/faculty/portal/attendance/absent-students?semester=${semester}&range=${dateRange}`);
            setTopAbsentStudents(absentResponse.data || []);
        } catch (error) {
            toast.error('Failed to load statistics');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [semester, dateRange]);

    if (loading) {
        return <div className="text-center py-8 text-gray-500">Loading statistics...</div>;
    }

    if (!stats) {
        return <div className="text-center py-8 text-gray-500">No data available</div>;
    }

    const attendancePercentage = ((stats.totalPresent / stats.totalRecords) * 100).toFixed(1);
    const absentPercentage = ((stats.totalAbsent / stats.totalRecords) * 100).toFixed(1);
    const latePercentage = ((stats.totalLate / stats.totalRecords) * 100).toFixed(1);
    const excusedPercentage = ((stats.totalExcused / stats.totalRecords) * 100).toFixed(1);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Attendance Statistics</h1>
                <p className="text-gray-500 text-sm mt-1">Comprehensive attendance analytics and insights</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-end gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Semester</label>
                    <select value={semester} onChange={e => setSemester(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Date Range</label>
                    <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none">
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="semester">Full Semester</option>
                    </select>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg border border-gray-100 p-4">
                    <div className="text-xs text-gray-500 font-semibold mb-1">Total Records</div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalRecords}</div>
                </div>
                <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                    <div className="text-xs text-green-600 font-semibold mb-1">Present</div>
                    <div className="text-3xl font-bold text-green-700">{stats.totalPresent}</div>
                    <div className="text-xs text-green-600 mt-1">{attendancePercentage}%</div>
                </div>
                <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                    <div className="text-xs text-red-600 font-semibold mb-1">Absent</div>
                    <div className="text-3xl font-bold text-red-700">{stats.totalAbsent}</div>
                    <div className="text-xs text-red-600 mt-1">{absentPercentage}%</div>
                </div>
                <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                    <div className="text-xs text-yellow-600 font-semibold mb-1">Late</div>
                    <div className="text-3xl font-bold text-yellow-700">{stats.totalLate}</div>
                    <div className="text-xs text-yellow-600 mt-1">{latePercentage}%</div>
                </div>
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                    <div className="text-xs text-blue-600 font-semibold mb-1">Excused</div>
                    <div className="text-3xl font-bold text-blue-700">{stats.totalExcused}</div>
                    <div className="text-xs text-blue-600 mt-1">{excusedPercentage}%</div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Distribution */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FaChartPie className="text-primary" />
                        <h3 className="font-semibold text-gray-900">Attendance Distribution</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: 'Present', value: stats.totalPresent, color: 'bg-green-500', percentage: attendancePercentage },
                            { label: 'Absent', value: stats.totalAbsent, color: 'bg-red-500', percentage: absentPercentage },
                            { label: 'Late', value: stats.totalLate, color: 'bg-yellow-500', percentage: latePercentage },
                            { label: 'Excused', value: stats.totalExcused, color: 'bg-blue-500', percentage: excusedPercentage }
                        ].map(item => (
                            <div key={item.label} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-700">{item.label}</span>
                                    <span className="text-gray-600">{item.value} ({item.percentage}%)</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${Math.min(item.percentage, 100)}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subject-wise Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FaChartBar className="text-primary" />
                        <h3 className="font-semibold text-gray-900">Subject-wise Summary</h3>
                    </div>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {stats.bySubject && Object.entries(stats.bySubject).map(([subject, data]) => (
                            <div key={subject} className="p-3 bg-gray-50 rounded-lg">
                                <div className="font-medium text-gray-900 text-sm">{subject}</div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-green-600">Present: {data.present || 0}</span>
                                    <span className="text-xs text-red-600">Absent: {data.absent || 0}</span>
                                    <span className="text-xs text-yellow-600">Late: {data.late || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Absent Students */}
            {topAbsentStudents.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                        <FaTrendingUp className="text-red-500" />
                        <h3 className="font-semibold text-gray-900">Students with High Absence</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Student Name</th>
                                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Enrollment</th>
                                    <th className="px-6 py-3 text-center font-semibold text-gray-700">Total Classes</th>
                                    <th className="px-6 py-3 text-center font-semibold text-gray-700">Absent</th>
                                    <th className="px-6 py-3 text-center font-semibold text-gray-700">Absence Rate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {topAbsentStudents.map((student, idx) => {
                                    const absenceRate = ((student.absentCount / student.totalClasses) * 100).toFixed(1);
                                    const rateColor = absenceRate > 30 ? 'text-red-600 bg-red-50' : absenceRate > 15 ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50';
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-3 font-medium text-gray-900">{student.name}</td>
                                            <td className="px-6 py-3 text-gray-600 text-xs">{student.enrollmentNumber}</td>
                                            <td className="px-6 py-3 text-center text-gray-600">{student.totalClasses}</td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
                                                    {student.absentCount}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-3 text-center font-semibold px-3 py-1 rounded-full text-xs inline-block ${rateColor}`}>
                                                {absenceRate}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick Insights */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">📊 Insights</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Overall attendance rate for this {dateRange} is <strong>{attendancePercentage}%</strong></li>
                    <li>• <strong>{stats.totalAbsent}</strong> absence records in the selected period</li>
                    <li>• Most common status is <strong>{['Present', 'Absent', 'Late', 'Excused'][Object.values({ present: stats.totalPresent, absent: stats.totalAbsent, late: stats.totalLate, excused: stats.totalExcused }).indexOf(Math.max(stats.totalPresent, stats.totalAbsent, stats.totalLate, stats.totalExcused))]}</strong></li>
                </ul>
            </div>
        </div>
    );
};

export default AttendanceStats;
