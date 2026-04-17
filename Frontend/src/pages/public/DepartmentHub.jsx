import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DEPARTMENT_DETAILS } from '../../constants/departments';
import api from '../../utils/axios';
import usePageTitle from '../../utils/usePageTitle';
import NoticeCard from '../../components/NoticeCard';

// Colour accent per department
const DEPT_COLORS = {
    ch: 'from-orange-600 to-orange-400',
    cp: 'from-blue-700 to-blue-500',
    cl: 'from-amber-700 to-amber-500',
    ee: 'from-yellow-600 to-yellow-400',
    ec: 'from-purple-700 to-purple-500',
    it: 'from-cyan-700 to-cyan-500',
    ic: 'from-teal-700 to-teal-500',
    me: 'from-gray-700 to-gray-500',
    pe: 'from-green-700 to-green-500',
    cseds: 'from-indigo-700 to-indigo-500',
    ei: 'from-pink-700 to-pink-500',
    ict: 'from-sky-700 to-sky-500',
};

const TABS = ['Overview', 'Notices', 'Events', 'Faculty'];

const DepartmentHub = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dept = DEPARTMENT_DETAILS.find(d => d.id === id);

    const [activeTab, setActiveTab] = useState('Overview');
    const [notices, setNotices] = useState([]);
    const [events, setEvents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState({});

    usePageTitle(dept ? `${dept.name} — Dept Hub` : 'Department');

    // Redirect if dept not found
    useEffect(() => { if (!dept) navigate('/'); }, [dept, navigate]);

    // Fetch notices for this department
    useEffect(() => {
        if (activeTab !== 'Notices' || !dept) return;
        setLoading(l => ({ ...l, notices: true }));
        api.get(`/notices?department=${encodeURIComponent(dept.name)}&limit=6`)
            .then(r => setNotices(r.data.data || []))
            .catch(() => setNotices([]))
            .finally(() => setLoading(l => ({ ...l, notices: false })));
    }, [activeTab, dept]);

    // Fetch events for this department
    useEffect(() => {
        if (activeTab !== 'Events' || !dept) return;
        setLoading(l => ({ ...l, events: true }));
        api.get(`/events?department=${encodeURIComponent(dept.name)}&limit=6`)
            .then(r => setEvents(r.data.data || []))
            .catch(() => setEvents([]))
            .finally(() => setLoading(l => ({ ...l, events: false })));
    }, [activeTab, dept]);

    // Fetch faculty for this department
    useEffect(() => {
        if (activeTab !== 'Faculty' || !dept) return;
        setLoading(l => ({ ...l, faculty: true }));
        api.get(`/faculty?department=${encodeURIComponent(dept.name)}&limit=12`)
            .then(r => setFaculty(r.data.data || []))
            .catch(() => setFaculty([]))
            .finally(() => setLoading(l => ({ ...l, faculty: false })));
    }, [activeTab, dept]);

    if (!dept) return null;

    const accent = DEPT_COLORS[id] || 'from-primary to-primary-700';

    return (
        <div className="animate-fade-in">
            {/* ── Hero Banner ── */}
            <div className={`bg-gradient-to-r ${accent} relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <Link to="/" className="text-white/70 text-sm hover:text-white transition mb-3 inline-flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                Back to Campus Map
                            </Link>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">{dept.code}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">{dept.name}</h1>
                            <p className="text-white/75 mt-3 max-w-2xl text-sm md:text-base">{dept.description}</p>
                        </div>
                    </div>

                    {/* Mini Stats */}
                    {dept.stats && (
                        <div className="flex flex-wrap gap-6 mt-8">
                            {dept.stats.map((s, i) => (
                                <div key={i} className="text-center bg-white/15 rounded-2xl px-6 py-3 backdrop-blur-sm">
                                    <p className="text-2xl font-black text-white">{s.val}</p>
                                    <p className="text-white/70 text-xs uppercase tracking-wider mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="border-b border-gray-200 bg-white sticky top-16 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-1 overflow-x-auto">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-4 text-sm font-semibold border-b-2 transition whitespace-nowrap ${activeTab === tab
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tab Content ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* OVERVIEW TAB */}
                {activeTab === 'Overview' && (
                    <div className="space-y-8">
                        {/* HOD Message */}
                        {dept.hod && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row gap-6">
                                <div className="flex-shrink-0 flex flex-col items-center">
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center`}>
                                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900 mt-3 text-center">{dept.hod.name}</p>
                                    <p className="text-xs text-gray-500 text-center">Head of Department</p>
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3">Message from the HOD</h2>
                                    <p className="text-gray-600 text-sm leading-relaxed italic">"{dept.hod.message}"</p>
                                </div>
                            </div>
                        )}

                        {/* Vision & Mission */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center mb-4`}>
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Vision</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{dept.vision}</p>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center mb-4`}>
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Mission</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{dept.mission}</p>
                            </div>
                        </div>

                        {/* Achievements */}
                        {dept.achievements && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-900 mb-4">🏆 Key Achievements</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {dept.achievements.map((a, i) => (
                                        <div key={i} className={`bg-gradient-to-br ${accent} rounded-xl p-4 text-white text-sm font-medium`}>
                                            {a}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick links to other tabs */}
                        <div className="grid grid-cols-3 gap-4">
                            {['Notices', 'Events', 'Faculty'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center hover:shadow-md transition group">
                                    <p className="font-bold text-gray-900 group-hover:text-primary transition text-sm">{tab}</p>
                                    <p className="text-gray-400 text-xs mt-1">View dept {tab.toLowerCase()} →</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* NOTICES TAB */}
                {activeTab === 'Notices' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Department Notices</h2>
                            <Link to={`/notices?dept=${encodeURIComponent(dept.name)}`} className="text-sm text-primary hover:underline">View all →</Link>
                        </div>
                        {loading.notices ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : notices.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {notices.map(n => <NoticeCard key={n._id} notice={n} />)}
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                                <p className="text-lg">No notices for this department yet.</p>
                                <Link to="/notices" className="mt-3 inline-block text-sm text-primary hover:underline">Browse all notices</Link>
                            </div>
                        )}
                    </div>
                )}

                {/* EVENTS TAB */}
                {activeTab === 'Events' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Department Events</h2>
                            <Link to="/events" className="text-sm text-primary hover:underline">View all →</Link>
                        </div>
                        {loading.events ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : events.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {events.map(e => (
                                    <div key={e._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                                        <span className="text-xs bg-primary/10 text-primary font-semibold px-2 py-1 rounded-full">{e.type}</span>
                                        <h3 className="font-bold text-gray-900 mt-3 mb-1 text-sm">{e.title}</h3>
                                        <p className="text-gray-500 text-xs line-clamp-2">{e.description}</p>
                                        <p className="text-accent text-xs font-medium mt-3">
                                            {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                                <p className="text-lg">No events for this department yet.</p>
                                <Link to="/events" className="mt-3 inline-block text-sm text-primary hover:underline">Browse all events</Link>
                            </div>
                        )}
                    </div>
                )}

                {/* FACULTY TAB */}
                {activeTab === 'Faculty' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Department Faculty</h2>
                            <Link to={`/faculty?dept=${encodeURIComponent(dept.name)}`} className="text-sm text-primary hover:underline">View all →</Link>
                        </div>
                        {loading.faculty ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}
                            </div>
                        ) : faculty.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {faculty.map(f => (
                                    <div key={f._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center hover:shadow-md transition">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accent} flex items-center justify-center mx-auto mb-3 text-white font-black text-xl`}>
                                            {f.name?.[0] || '?'}
                                        </div>
                                        <p className="font-bold text-gray-900 text-sm">{f.name}</p>
                                        <p className="text-gray-500 text-xs mt-0.5">{f.designation}</p>
                                        {f.specialization && <p className="text-primary text-xs mt-1">{f.specialization}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                                <p className="text-lg">No faculty listed for this department yet.</p>
                                <Link to="/faculty" className="mt-3 inline-block text-sm text-primary hover:underline">Browse all faculty</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepartmentHub;
