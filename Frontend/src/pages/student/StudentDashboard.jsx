import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import api from '../../utils/axios';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { FiClock, FiAward, FiBook, FiChevronRight, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

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
            <div className="animate-pulse space-y-6">
                <div className="h-36 bg-white border border-gray-100 rounded-3xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-28 bg-white border border-gray-100 rounded-2xl"></div>
                    <div className="h-28 bg-white border border-gray-100 rounded-2xl md:col-span-2"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64 bg-white border border-gray-100 rounded-2xl"></div>
                    <div className="h-64 bg-white border border-gray-100 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Elegant Header Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-8 text-white shadow-xl shadow-primary-900/10 border border-primary-800">
                {/* Decorative glowing backdrops */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary-400/20 rounded-full blur-2xl opacity-40"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wider text-accent-300 uppercase mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Academic Session Active
                        </span>
                        <h1 className="text-3xl font-extrabold tracking-tight font-heading mb-1 text-white">
                            Welcome back, {user?.name?.split(' ')[0]}!
                        </h1>
                        <p className="text-primary-100/90 text-sm font-medium">
                            Enrollment No: <span className="text-white font-semibold">{user?.enrollmentNumber}</span> | Semester: <span className="text-white font-semibold">{user?.semester}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-3 rounded-2xl">
                        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-md shadow-accent/20">
                            <FiBook className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] text-primary-200 uppercase font-bold tracking-wider">Department</p>
                            <p className="text-sm font-bold text-white truncate max-w-[200px]">{user?.department}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Insights Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-fade-in">
                {/* Pending Tasks */}
                <StatCard
                    icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    label="Pending Assignments"
                    value={stats.assignmentsPending}
                    color="bg-accent"
                />

                {/* Aesthetic Circular Attendance Chart Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 p-6 flex flex-col sm:flex-row items-center justify-between md:col-span-2 group card-hover relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/5 to-transparent rounded-bl-full"></div>
                    <div className="space-y-2 text-center sm:text-left z-10">
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Overall Attendance</h3>
                        <div className="flex items-baseline justify-center sm:justify-start gap-1">
                            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">{stats.attendancePercentage}%</span>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Healthy</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">Based on <span className="font-semibold text-gray-700">{stats.totalClasses}</span> total marked sessions</p>
                        {stats.attendancePercentage < 75 ? (
                            <p className="text-xs text-red-500 font-semibold flex items-center justify-center sm:justify-start gap-1 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100 mt-2 animate-bounce">
                                <FiAlertTriangle /> Attendance shortage! Below 75%
                            </p>
                        ) : (
                            <p className="text-xs text-emerald-600 font-semibold flex items-center justify-center sm:justify-start gap-1 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100 mt-2">
                                <FiCheckCircle /> Keep it up! Attendance criteria met.
                            </p>
                        )}
                    </div>

                    <div className="h-28 w-28 shrink-0 relative mt-4 sm:mt-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={34} outerRadius={46} paddingAngle={3} dataKey="value" stroke="none">
                                    {attendanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="transition-all duration-500 hover:opacity-90" />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-sm font-black text-gray-800">{stats.attendancePercentage}%</span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase">Present</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results + Upcoming Deadlines grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Results */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200/60 p-6 card-hover">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FiAward className="text-primary-600" /> Recent Results
                            </h2>
                            <p className="text-xs text-gray-400">Your latest graded tests and midterms</p>
                        </div>
                        <Link to="/student-portal/results" className="inline-flex items-center gap-1 text-xs text-primary hover:text-accent font-bold uppercase tracking-wider transition">
                            View All <FiChevronRight />
                        </Link>
                    </div>

                    {recentResults.length > 0 ? (
                        <div className="space-y-3 stagger-fade-in">
                            {recentResults.map((result, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50/60 hover:bg-gray-50 border border-gray-100 rounded-2xl transition group duration-300">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition truncate">{result.subjectName || result.subject}</p>
                                        <span className="inline-flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-200/50 px-2 py-0.5 rounded-md">{result.examType}</span>
                                            <span className="text-[10px] text-gray-400 font-semibold">Semester {result.semester}</span>
                                        </span>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-base font-black ${result.grade === 'F' ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {result.marksObtained}/{result.totalMarks}
                                        </p>
                                        {result.grade && <span className="text-[10px] text-gray-400 font-bold bg-white px-2 py-0.5 border border-gray-100 rounded-md">Grade {result.grade}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                            <FiAward className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                            <p className="font-semibold text-gray-500">No results published yet</p>
                            <p className="text-xs text-gray-400 mt-1">Grades will show up here once graded by faculty</p>
                        </div>
                    )}
                </div>

                {/* Upcoming Deadlines */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-200/60 p-6 card-hover">
                    <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FiClock className="text-accent" /> Upcoming Deadlines
                            </h2>
                            <p className="text-xs text-gray-400">Keep track of upcoming submissions</p>
                        </div>
                        <Link to="/student-portal/assignments" className="inline-flex items-center gap-1 text-xs text-primary hover:text-accent font-bold uppercase tracking-wider transition">
                            View All <FiChevronRight />
                        </Link>
                    </div>

                    {upcomingAssignments.length > 0 ? (
                        <div className="space-y-3 stagger-fade-in">
                            {upcomingAssignments.map((a, i) => {
                                const daysLeft = Math.ceil((new Date(a.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50/60 hover:bg-gray-50 border border-gray-100 rounded-2xl transition duration-300 group">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-sm font-bold text-gray-800 group-hover:text-primary transition truncate">{a.title}</p>
                                            <p className="text-xs text-gray-400 mt-1">{a.subject} · Due <span className="font-semibold text-gray-600">{formatDate(a.dueDate)}</span></p>
                                        </div>
                                        <span className={`shrink-0 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm ${
                                            daysLeft <= 2 
                                                ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' 
                                                : daysLeft <= 5 
                                                    ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                                                    : 'bg-green-50 text-green-600 border border-green-100'
                                        }`}>
                                            {daysLeft === 0 ? 'Today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                            <FiClock className="w-12 h-12 text-gray-200 mx-auto mb-3 animate-bounce" />
                            <p className="font-semibold text-gray-500">All assignments complete! 🎉</p>
                            <p className="text-xs text-gray-400 mt-1">Sit back and relax or explore resources library</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
