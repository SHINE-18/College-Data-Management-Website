import { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard';
import api from '../../utils/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import usePageTitle from '../../utils/usePageTitle';
import { FiTrendingUp, FiActivity, FiLayers, FiRefreshCw, FiInbox } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    usePageTitle('Admin Dashboard');

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('Failed to load admin stats:', error);
            toast.error('Failed to load admin metrics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse space-y-6">
                <div className="h-28 bg-white border border-gray-100 rounded-3xl"></div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
                </div>
                <div className="h-72 bg-gray-200 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8">
            {/* Elegant Header Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-8 text-white shadow-xl shadow-primary-950/10 border border-primary-800">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary-400/20 rounded-full blur-2xl opacity-40"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wider text-accent-300 uppercase mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span> Root Authority Active
                        </span>
                        <h1 className="text-3xl font-extrabold tracking-tight font-heading mb-1">
                            Super Admin Dashboard
                        </h1>
                        <p className="text-primary-100/90 text-sm font-medium">
                            Overview department logs, circular streams, active publications, and student stats.
                        </p>
                    </div>
                    <button 
                        onClick={fetchStats}
                        className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white transition backdrop-blur-md self-start sm:self-center"
                        title="Reload Metrics"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stat Cards Matrix */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 stagger-fade-in">
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

            {/* Department Faculty Distribution Chart */}
            {stats?.departmentStats?.length > 0 ? (
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <FiActivity className="text-primary" /> Faculty Allocation By Department
                            </h2>
                            <p className="text-xs text-gray-400">Total verified faculty rosters grouped by academic domain</p>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl flex items-center gap-1">
                            <FiLayers /> {stats.departmentStats.length} Active Departments
                        </span>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.departmentStats} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fontWeight: 500, fill: '#64748b' }} allowDecimals={false} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(30, 58, 95, 0.02)', radius: 8 }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)', padding: '12px' }}
                                    formatter={(value, name, props) => [value, props.payload.fullName || name]}
                                />
                                <Bar dataKey="faculty" radius={[8, 8, 0, 0]} barSize={36}>
                                    {stats.departmentStats.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={index % 2 === 0 ? '#1e3a5f' : '#d97706'} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-16 text-center shadow-sm">
                    <FiInbox className="text-6xl text-gray-200 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-700 text-lg">No department stats loaded</h3>
                    <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                         Roster stats will display here once faculty members link their official university department profiles.
                    </p>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
