import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AttendanceViewer = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                // Assuming backend groups by subject for summary, or we aggregate it here.
                const { data } = await api.get('/student/attendance');

                // Aggregate logic to group by subject for the bar chart
                const grouped = data.reduce((acc, curr) => {
                    if (!acc[curr.subject]) {
                        acc[curr.subject] = { present: 0, total: 0 };
                    }
                    acc[curr.subject].total += 1;
                    if (curr.status === 'Present') acc[curr.subject].present += 1;
                    return acc;
                }, {});

                const chartData = Object.keys(grouped).map(subject => ({
                    subject,
                    percentage: Math.round((grouped[subject].present / grouped[subject].total) * 100),
                    present: grouped[subject].present,
                    total: grouped[subject].total
                }));

                setAttendanceData(chartData);

            } catch (error) {
                console.error("Failed to load attendance", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance Tracker</h1>
                    <p className="text-gray-500 text-sm mt-1">View your attendance records by subject.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Subject-wise Percentage</h2>
                <div className="h-80">
                    {attendanceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="subject" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(val) => `${val}%`} domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value, name, props) => [`${value}% (${props.payload.present}/${props.payload.total} classes)`, 'Attendance']}
                                />
                                <Bar dataKey="percentage" fill="#1e3a5f" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>No attendance data recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendanceData.map(record => (
                    <div key={record.subject} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-primary/30 transition shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-gray-900 truncate pr-4">{record.subject}</h3>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${record.percentage >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {record.percentage}%
                            </span>
                        </div>

                        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                            <div className={`h-2.5 rounded-full ${record.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${record.percentage}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Attended {record.present} of {record.total} classes</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttendanceViewer;
