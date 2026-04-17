import { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard';
import api from '../../utils/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import usePageTitle from '../../utils/usePageTitle';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    usePageTitle('Admin Dashboard');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin/stats');
                setStats(data);
            } catch (error) {
                console.error('Failed to load admin stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-24 bg-gray-200 rounded-2xl"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
                </div>
                <div className="h-72 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8">
            <div className="bg-gradient-to-r from-primary-700 to-primary rounded-2xl p-8 text-white">
                <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
                <p className="text-primary-100 mt-1 text-sm">Cross-department overview and institutional management.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    label="Total Faculty"
                    value={stats?.totalFaculty ?? '—'}
                    color="bg-primary"
                />
                <StatCard
                    icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    label="Total Students"
                    value={stats?.totalStudents ?? '—'}
                    color="bg-accent"
                />
                <StatCard
                    icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    label="Publications"
                    value={stats?.totalPublications ?? '—'}
                    color="bg-purple-500"
                />
                <StatCard
                    icon="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                    label="Active Notices"
                    value={stats?.activeNotices ?? '—'}
                    color="bg-emerald-500"
                />
            </div>

            {stats?.departmentStats?.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Faculty Count by Department</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.departmentStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    formatter={(value, name, props) => [value, props.payload.fullName || name]}
                                />
                                <Bar dataKey="faculty" fill="#2980b9" radius={[6, 6, 0, 0]} name="Faculty Count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {!loading && (!stats?.departmentStats || stats.departmentStats.length === 0) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400 text-sm">
                    No department data available yet.
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
