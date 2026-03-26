import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import api from '../../utils/axios';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ attendancePercentage: 0, assignmentsPending: 0, totalClasses: 0 });
    const [recentResults, setRecentResults] = useState([]);
    const [upcomingAssignments, setUpcomingAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [dashRes, resultsRes, assignmentsRes] = await Promise.all([
                    api.get('/student/dashboard'),
                    api.get('/student/results'),
                    api.get('/student/assignments'),
                ]);
                setStats(dashRes.data);
                setRecentResults((resultsRes.data || []).slice(0, 5));

                // Filter only upcoming (not yet submitted, due in future)
                const now = new Date();
                const upcoming = (assignmentsRes.data || [])
                    .filter(a => !a.isSubmitted && new Date(a.dueDate) >= now)
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .slice(0, 5);
                setUpcomingAssignments(upcoming);
            } catch (error) {
                console.error('Failed to fetch student dashboard data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const attendanceData = [
        { name: 'Present', value: stats.attendancePercentage },
        { name: 'Absent', value: 100 - stats.attendancePercentage }
    ];
    const COLORS = ['#10b981', '#ef4444'];

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-32 bg-gray-200 rounded-2xl"></div>
                <div className="grid grid-cols-3 gap-4"><div className="h-24 bg-gray-200 rounded-xl col-span-3"></div></div>
                <div className="grid grid-cols-2 gap-4"><div className="h-48 bg-gray-200 rounded-xl"></div><div className="h-48 bg-gray-200 rounded-xl"></div></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                    <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}!</h1>
                    <p className="text-primary-100 text-sm">Enrollment No: {user?.enrollmentNumber} | Semester: {user?.semester} {user?.department}</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    label="Pending Assignments"
                    value={stats.assignmentsPending}
                    color="bg-accent"
                />
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between md:col-span-2">
                    <div>
                        <h3 className="text-gray-500 text-sm font-medium mb-1">Overall Attendance</h3>
                        <div className="text-3xl font-bold text-gray-900">{stats.attendancePercentage}%</div>
                        <p className="text-xs text-gray-400 mt-2">Based on {stats.totalClasses} total marked sessions</p>
                        {stats.attendancePercentage < 75 && (
                            <p className="text-xs text-red-500 mt-1 font-medium">⚠️ Below 75% — attendance shortage</p>
                        )}
                    </div>
                    <div className="h-24 w-24">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={2} dataKey="value" stroke="none">
                                    {attendanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Results + Upcoming Deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Results */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Recent Results</h2>
                        <Link to="/student-portal/results" className="text-xs text-primary hover:underline font-medium">View All →</Link>
                    </div>
                    {recentResults.length > 0 ? (
                        <div className="space-y-3">
                            {recentResults.map((result, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{result.subjectName || result.subject}</p>
                                        <p className="text-xs text-gray-400">{result.examType} · Sem {result.semester}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${result.grade === 'F' ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {result.marksObtained}/{result.totalMarks}
                                        </p>
                                        {result.grade && <span className="text-xs text-gray-400">Grade: {result.grade}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                            No results published yet.
                        </div>
                    )}
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Upcoming Deadlines</h2>
                        <Link to="/student-portal/assignments" className="text-xs text-primary hover:underline font-medium">View All →</Link>
                    </div>
                    {upcomingAssignments.length > 0 ? (
                        <div className="space-y-3">
                            {upcomingAssignments.map((a, i) => {
                                const daysLeft = Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{a.title}</p>
                                            <p className="text-xs text-gray-400">{a.subject} · Due {formatDate(a.dueDate)}</p>
                                        </div>
                                        <span className={`ml-3 flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${daysLeft <= 2 ? 'bg-red-100 text-red-600' : daysLeft <= 5 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                            {daysLeft === 0 ? 'Today' : daysLeft === 1 ? '1 day' : `${daysLeft} days`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                            No pending assignments! 🎉
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
