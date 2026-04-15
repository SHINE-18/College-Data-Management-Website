// ============================================
// pages/Placements.jsx — Placement Statistics Page
// ============================================

import { useState, useEffect } from 'react';
import api from '../utils/axios';

const Placements = () => {
    const [placements, setPlacements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalPlaced: 0, avgPackage: 0, highestPackage: 0, companiesCount: 0 });

    useEffect(() => {
        const fetchPlacements = async () => {
            try {
                const { data } = await api.get('/placements');
                const list = Array.isArray(data) ? data : (data.data || []);
                setPlacements(list);

                // Compute summary stats
                if (list.length > 0) {
                    const totalPlaced = list.reduce((acc, p) => acc + (p.studentsPlaced || 0), 0);
                    const packages = list.filter(p => p.packageLPA > 0).map(p => p.packageLPA);
                    const avgPackage = packages.length > 0 ? (packages.reduce((a, b) => a + b, 0) / packages.length).toFixed(1) : 0;
                    const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;
                    const companiesCount = list.length;
                    setStats({ totalPlaced, avgPackage, highestPackage, companiesCount });
                }
            } catch {
                // Backend offline
            } finally {
                setLoading(false);
            }
        };
        fetchPlacements();
    }, []);

    const statCards = [
        { label: 'Students Placed', value: stats.totalPlaced, icon: '🎓', color: 'from-blue-600 to-blue-700' },
        { label: 'Avg. Package', value: `${stats.avgPackage} LPA`, icon: '💰', color: 'from-green-600 to-green-700' },
        { label: 'Highest Package', value: `${stats.highestPackage} LPA`, icon: '🏆', color: 'from-amber-500 to-orange-600' },
        { label: 'Recruiting Companies', value: stats.companiesCount, icon: '🏢', color: 'from-purple-600 to-purple-700' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-16 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3">Placement Statistics</h1>
                    <p className="text-primary-200 text-lg">CE Department — Academic Year 2024-25</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-10 -mt-8">
                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {statCards.map((sc, i) => (
                        <div key={i} className={`bg-gradient-to-br ${sc.color} text-white rounded-2xl p-5 shadow-lg`}>
                            <div className="text-3xl mb-2">{sc.icon}</div>
                            <div className="text-2xl font-bold">{sc.value}</div>
                            <div className="text-sm opacity-80 mt-1">{sc.label}</div>
                        </div>
                    ))}
                </div>

                {/* Recruiter cards */}
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recruiting Companies</h2>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 animate-pulse h-32" />
                        ))}
                    </div>
                ) : placements.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">No placement data available yet.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {placements.map(p => (
                            <div key={p._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 flex flex-col gap-2 hover:shadow-lg transition">
                                <div className="flex items-center gap-3">
                                    {p.companyLogo ? (
                                        <img src={p.companyLogo} alt={p.companyName} className="w-12 h-12 object-contain rounded-lg border bg-white" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary font-bold text-lg">
                                            {p.companyName?.[0]}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{p.companyName}</h3>
                                        {p.sector && <span className="text-xs text-gray-500">{p.sector}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    {p.packageLPA > 0 && (
                                        <span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-1 rounded-full">
                                            💰 {p.packageLPA} LPA
                                        </span>
                                    )}
                                    {p.studentsPlaced > 0 && (
                                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-semibold px-2 py-1 rounded-full">
                                            👥 {p.studentsPlaced} placed
                                        </span>
                                    )}
                                </div>
                                {p.jobRole && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{p.jobRole}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Placements;
