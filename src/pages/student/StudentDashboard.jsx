import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import api from '../../utils/axios';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        attendancePercentage: 0,
        assignmentsPending: 0,
        totalClasses: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const { data } = await api.get('/student/dashboard');
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch student dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const attendanceData = [
        { name: 'Present', value: stats.attendancePercentage },
        { name: 'Absent', value: 100 - stats.attendancePercentage }
    ];
    const COLORS = ['#10b981', '#ef4444'];

    if (loading) {
        return <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-2xl"></div>
            <div className="grid grid-cols-3 gap-4"><div className="h-24 bg-gray-200 rounded-xl"></div></div>
        </div>;
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
                    </div>
                    <div className="h-24 w-24">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={attendanceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={25}
                                    outerRadius={40}
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Results</h2>
                    <p className="text-sm text-gray-500 mb-4">Your latest exam grades will appear here.</p>
                    {/* Results list mapping goes here eventually */}
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                        No recent results published.
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Deadlines</h2>
                    <p className="text-sm text-gray-500 mb-4">Assignments due soon.</p>
                    {/* Assignments list mapping goes here eventually */}
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                        You have no pending assignments!
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
