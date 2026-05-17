import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FiCheckCircle, FiAlertCircle, FiPercent, FiBookOpen, FiActivity, FiLayers } from 'react-icons/fi';

const AttendanceViewer = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const { data } = await api.get('/student/attendance');

                // Aggregate logic to group by subject for the bar chart
                const grouped = (data || []).reduce((acc, curr) => {
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

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-28 bg-white border border-gray-100 rounded-3xl"></div>
                <div className="h-80 bg-white border border-gray-100 rounded-3xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white border border-gray-100 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    const overallAttended = attendanceData.reduce((acc, curr) => acc + curr.present, 0);
    const overallTotal = attendanceData.reduce((acc, curr) => acc + curr.total, 0);
    const overallPercentage = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 0;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Elegant Header & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight font-heading">Attendance Hub</h1>
                    <p className="text-sm text-gray-400 font-medium mt-1">Track your class attendance by subject and term requirements.</p>
                </div>
                
                {/* Visual Overview Badge */}
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm border border-gray-200/60 p-4 rounded-3xl shadow-sm shrink-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold ${overallPercentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                        {overallPercentage}%
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Aggregate Attendance</span>
                        <span className="text-xs text-gray-800 font-black">{overallAttended} of {overallTotal} lectures attended</span>
                    </div>
                </div>
            </div>

            {/* Attendance Chart */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FiActivity className="text-primary" /> Subject-wise Percentage
                        </h2>
                        <p className="text-xs text-gray-400">Review attendance distribution across all courses</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl">
                        Target: 75% Attendance
                    </span>
                </div>

                <div className="h-80">
                    {attendanceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="subject" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={(val) => `${val}%`} domain={[0, 100]} tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(30, 58, 95, 0.02)', radius: 8 }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)', padding: '12px' }}
                                    formatter={(value, name, props) => [`${value}% (${props.payload.present}/${props.payload.total} lectures)`, 'Attendance']}
                                />
                                <Bar dataKey="percentage" radius={[8, 8, 0, 0]} barSize={32}>
                                    {attendanceData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.percentage >= 75 ? '#10b981' : '#f43f5e'} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                            <FiBookOpen className="w-12 h-12 mb-3 text-gray-300" />
                            <p className="font-semibold text-gray-500">No attendance records found.</p>
                            <p className="text-xs text-gray-400 mt-1">Please wait for faculty to mark attendance.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Dynamic Grid for Subjects */}
            {attendanceData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-fade-in">
                    {attendanceData.map(record => (
                        <div key={record.subject} className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gray-500/5 to-transparent rounded-bl-full"></div>
                            
                            <div className="flex justify-between items-start gap-4 mb-5">
                                <div className="min-w-0">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Course</span>
                                    <h3 className="font-bold text-gray-800 group-hover:text-primary transition truncate text-sm">{record.subject}</h3>
                                </div>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-black rounded-full border ${
                                    record.percentage >= 75 
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                        : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                    {record.percentage}%
                                </span>
                            </div>

                            {/* Custom progress indicators */}
                            <div className="space-y-3">
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${
                                            record.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                                        }`} 
                                        style={{ width: `${record.percentage}%` }}
                                    ></div>
                                </div>
                                
                                <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                                    <span className="flex items-center gap-1">
                                        {record.percentage >= 75 ? (
                                            <FiCheckCircle className="text-emerald-500" />
                                        ) : (
                                            <FiAlertCircle className="text-rose-500" />
                                        )}
                                        {record.percentage >= 75 ? 'Meets threshold' : 'Attendance shortfall'}
                                    </span>
                                    <span className="font-bold text-gray-700">{record.present} / {record.total} classes</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttendanceViewer;
