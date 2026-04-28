import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/axios';
import AnnouncementTicker from '../../components/AnnouncementTicker';

/* ─── accent colour per dept code (falls back to primary) ─────── */
const DEPT_COLORS = {
    CH:     'from-orange-600 to-orange-400',
    CP:     'from-blue-700 to-blue-500',
    CL:     'from-amber-700 to-amber-500',
    EE:     'from-yellow-600 to-yellow-400',
    EC:     'from-purple-700 to-purple-500',
    IT:     'from-cyan-700 to-cyan-500',
    IC:     'from-teal-700 to-teal-500',
    ME:     'from-gray-700 to-gray-500',
    PE:     'from-green-700 to-green-500',
    'CSE-DS': 'from-indigo-700 to-indigo-500',
    EI:     'from-pink-700 to-pink-500',
    ICT:    'from-sky-700 to-sky-500',
};

const TABS = ['Overview', 'Placements', 'Faculty', 'Notices', 'Events'];

const DepartmentDetail = () => {
    const { id } = useParams();           // the url segment, e.g. "cp"  OR  a mongo _id

    const [dept, setDept]               = useState(null);
    const [faculty, setFaculty]         = useState([]);
    const [hodProfile, setHodProfile]   = useState(null);
    const [placements, setPlacements]   = useState([]);
    const [notices, setNotices]         = useState([]);
    const [events, setEvents]           = useState([]);
    const [loading, setLoading]         = useState(true);
    const [tabLoading, setTabLoading]   = useState(false);
    const [activeTab, setActiveTab]     = useState('Overview');

    /* ── initial fetch: department + faculty ──────────────────── */
    useEffect(() => {
        const fetchDept = async () => {
            setLoading(true);
            try {
                // Accept both short code (cp) and full mongo id
                const query = id.length === 24
                    ? `/departments/${id}`
                    : `/departments/search?code=${id}`;
                const deptRes = await api.get(query);
                const currentDept = deptRes.data.data || deptRes.data;
                setDept(currentDept);

                if (currentDept) {
                    const [facRes, hodRes] = await Promise.all([
                        api.get(`/faculty?department=${encodeURIComponent(currentDept.name)}&limit=6`),
                        api.get(`/faculty?department=${encodeURIComponent(currentDept.name)}&designation=HOD&limit=1`),
                    ]);
                    setFaculty(facRes.data.data || []);
                    if (hodRes.data.data?.length) setHodProfile(hodRes.data.data[0]);
                }
            } catch (err) {
                console.error('Department fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDept();
        window.scrollTo(0, 0);
    }, [id]);

    /* ── lazy fetch per tab ───────────────────────────────────── */
    useEffect(() => {
        if (!dept) return;
        const deptName = encodeURIComponent(dept.name);

        const loadTab = async () => {
            setTabLoading(true);
            try {
                if (activeTab === 'Placements') {
                    const res = await api.get(`/placements?department=${deptName}`);
                    setPlacements(Array.isArray(res.data) ? res.data : []);
                } else if (activeTab === 'Notices') {
                    const res = await api.get(`/notices?department=${deptName}&limit=9`);
                    setNotices(res.data.data || []);
                } else if (activeTab === 'Events') {
                    const res = await api.get(`/events?department=${deptName}&limit=9`);
                    setEvents(res.data.data || []);
                }
            } catch { /* silent */ }
            finally { setTabLoading(false); }
        };

        if (['Placements', 'Notices', 'Events'].includes(activeTab)) loadTab();
    }, [activeTab, dept]);

    /* ── helpers ─────────────────────────────────────────────── */
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!dept) {
        return (
            <div className="text-center py-20 text-slate-500 font-medium text-lg">
                Department not found.
                <br />
                <Link to="/" className="text-primary hover:underline mt-4 inline-block">Return to Home</Link>
            </div>
        );
    }

    const accentGrad = DEPT_COLORS[dept.code?.toUpperCase()] || 'from-primary-700 to-primary';

    /* ── render ──────────────────────────────────────────────── */
    return (
        <div className="animate-fade-in pb-20 bg-slate-50/50">
            <AnnouncementTicker department={dept.name} />

            {/* ═════════════ HERO ═════════════ */}
            <div className={`bg-gradient-to-r ${accentGrad} relative overflow-hidden py-24`}>
                {/* decorative hatching */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex items-center space-x-3 text-white/70 text-xs font-bold uppercase tracking-widest mb-4">
                        <Link to="/" className="hover:text-white transition">VGEC</Link>
                        <span>/</span>
                        <span className="text-white">Departments</span>
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                        <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">
                            {dept.code}
                        </span>
                        {dept.established && (
                            <span className="bg-white/10 text-white/70 text-xs font-bold px-3 py-1 rounded-full">
                                Est. {dept.established}
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
                        Department of <br />
                        <span className="text-white/90">{dept.name}</span>
                    </h1>
                    <p className="text-white/75 text-lg max-w-2xl font-medium leading-relaxed">{dept.description}</p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link to={`/notices?dept=${encodeURIComponent(dept.name)}`}
                            className="bg-white text-slate-800 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition shadow-xl text-sm flex items-center gap-2">
                            Notice Board
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                        <Link to={`/faculty?dept=${encodeURIComponent(dept.name)}`}
                            className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-6 py-2.5 rounded-xl font-bold hover:bg-white/30 transition text-sm">
                            Meet Faculty
                        </Link>
                    </div>
                </div>
            </div>

            {/* ═════════════ STATS BAR ═════════════ */}
            {dept.stats?.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {dept.stats.map((s, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-lg p-5 text-center border border-slate-100">
                                <p className={`text-3xl font-black bg-gradient-to-r ${accentGrad} bg-clip-text text-transparent`}>{s.val}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═════════════ TABS ═════════════ */}
            <div className="sticky top-[152px] z-30 bg-white border-b border-slate-200 shadow-sm mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-0 overflow-x-auto">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-5 py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${
                                    activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═════════════ TAB CONTENT ═════════════ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* ═══ OVERVIEW TAB ═══ */}
                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* About */}
                            {dept.detailAbout && (
                                <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-5 flex items-center">
                                        <span className="w-1.5 h-6 bg-primary rounded-full mr-3"></span>
                                        About the Department
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed font-medium">{dept.detailAbout}</p>
                                </section>
                            )}

                            {/* HOD Card */}
                            <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:text-primary/10 transition">
                                    <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11.5L13.017 11.5L13.017 9C13.017 7.89543 13.9124 7 15.017 7H19.017C20.1216 7 21.017 7.89543 21.017 9V15C21.017 18.3137 18.3307 21 15.017 21L14.017 21ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.017C5.46472 8 5.017 8.44772 5.017 9V11.5L4.017 11.5L4.017 9C4.017 7.89543 4.91243 7 6.017 7H10.017C11.1216 7 12.017 7.89543 12.017 9V15C12.017 18.3137 9.33071 21 6.017 21L5.017 21Z" />
                                    </svg>
                                </div>

                                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                    {/* Photo */}
                                    <div className="w-40 h-48 shrink-0 relative">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${accentGrad} rounded-2xl rotate-3 opacity-20`}></div>
                                        <div className={`absolute inset-0 bg-gradient-to-br ${accentGrad} rounded-2xl -rotate-3 opacity-10`}></div>
                                        <div className="relative w-full h-full bg-slate-100 rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                                            {hodProfile?.profilePhoto ? (
                                                <img
                                                    src={api.defaults.baseURL + hodProfile.profilePhoto}
                                                    alt={hodProfile.name}
                                                    className="w-full h-full object-cover"
                                                    onError={e => { e.target.onerror = null; e.target.src = '/assets/placeholder-avatar.png'; }}
                                                />
                                            ) : (
                                                <div className={`w-full h-full bg-gradient-to-br ${accentGrad} flex items-center justify-center text-4xl text-white font-black`}>
                                                    {(hodProfile?.name || dept.hod?.name || 'H')[0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Text */}
                                    <div className="space-y-4 flex-1">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                                {hodProfile ? (
                                                    <Link to={`/faculty/${hodProfile._id}`} className="hover:text-primary transition">
                                                        {hodProfile.name}
                                                    </Link>
                                                ) : (dept.hod?.name || 'Unassigned')}
                                            </h2>
                                            <p className="text-primary font-bold text-xs uppercase tracking-widest mt-0.5">Head of Department</p>
                                        </div>

                                        {dept.hod?.message && (
                                            <p className="text-slate-600 leading-relaxed italic text-lg font-medium">
                                                "{dept.hod.message}"
                                            </p>
                                        )}

                                        {/* HOD Video – only shown if set */}
                                        {dept.hod?.videoUrl && (
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                                                <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-500 text-center">
                                                    Message from the HOD
                                                </p>
                                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg">
                                                    <div className="relative w-full pt-[56.25%]">
                                                        <iframe
                                                            className="absolute inset-0 h-full w-full"
                                                            src={dept.hod.videoUrl}
                                                            title="HOD Message"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            referrerPolicy="strict-origin-when-cross-origin"
                                                            allowFullScreen
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Vision & Mission */}
                            {(dept.vision || dept.mission) && (
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {dept.vision && (
                                        <div className={`bg-gradient-to-br ${accentGrad} text-white rounded-3xl p-8 shadow-xl relative overflow-hidden`}>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-black mb-3">Vision</h3>
                                            <p className="text-white/85 font-medium leading-relaxed">{dept.vision}</p>
                                        </div>
                                    )}
                                    {dept.mission && (
                                        <div className="bg-white text-slate-800 border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
                                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6">
                                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-black text-primary mb-3">Mission</h3>
                                            <p className="text-slate-500 font-medium leading-relaxed">{dept.mission}</p>
                                        </div>
                                    )}
                                </section>
                            )}

                            {/* Research Areas */}
                            {dept.researchAreas?.length > 0 && (
                                <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-7 flex items-center">
                                        <span className="w-1.5 h-6 bg-accent rounded-full mr-3"></span>
                                        Research Areas
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {dept.researchAreas.map((area, i) => (
                                            <div key={i} className="group p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-primary/20 hover:shadow-xl transition-all duration-300">
                                                <h4 className="font-bold text-primary mb-4 group-hover:text-accent transition text-base">{area.title}</h4>
                                                <div className="flex justify-between text-[10px] font-black tracking-widest text-slate-400">
                                                    {area.faculty ? <span>{area.faculty} FACULTY</span> : null}
                                                    {area.projects ? <span>{area.projects} PROJECTS</span> : null}
                                                    {area.courses ? <span>{area.courses} COURSES</span> : null}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Achievements */}
                            {dept.achievements?.length > 0 && (
                                <section className="bg-slate-50 rounded-3xl p-8 border border-slate-200/60">
                                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center">
                                        <span className="w-1.5 h-6 bg-accent rounded-full mr-3"></span>
                                        Departmental Milestones
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {dept.achievements.map((a, i) => (
                                            <div key={i} className="flex items-center space-x-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                                <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center shrink-0">
                                                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm font-bold text-slate-600">{a}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* RIGHT SIDEBAR */}
                        <div className="space-y-6">
                            {/* Quick Links */}
                            <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-5 text-center">Resources</h3>
                                <div className="space-y-2">
                                    {[
                                        { name: 'Syllabus Archive', path: `/syllabi?dept=${encodeURIComponent(dept.name)}`, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                                        { name: 'Branch Timetable', path: `/timetable?dept=${encodeURIComponent(dept.name)}`, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                                        { name: 'Faculty Directory', path: `/faculty?dept=${encodeURIComponent(dept.name)}`, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                                        { name: 'Department Events', path: `/events?dept=${encodeURIComponent(dept.name)}`, icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
                                    ].map((item, idx) => (
                                        <Link key={idx} to={item.path} className="flex items-center p-3 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group">
                                            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                                </svg>
                                            </div>
                                            <span className="ml-3 font-bold text-slate-600 text-sm transition group-hover:text-primary">{item.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            {/* Recent Faculty */}
                            <section className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-base font-black text-slate-800">Department Faculty</h3>
                                    <Link to={`/faculty?dept=${encodeURIComponent(dept.name)}`} className="text-xs font-bold text-accent hover:underline">See All</Link>
                                </div>
                                <div className="space-y-3">
                                    {faculty.slice(0, 4).map(f => (
                                        <Link key={f._id} to={`/faculty/${f._id}`} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 transition group">
                                            <div className={`w-11 h-11 bg-gradient-to-br ${accentGrad} rounded-full flex items-center justify-center shrink-0`}>
                                                {f.profilePhoto ? (
                                                    <img src={api.defaults.baseURL + f.profilePhoto} alt={f.name}
                                                        className="w-full h-full object-cover rounded-full"
                                                        onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                                                ) : (
                                                    <span className="text-white font-bold text-sm">{f.name[0]}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition">{f.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{f.designation}</p>
                                            </div>
                                        </Link>
                                    ))}
                                    {faculty.length === 0 && (
                                        <p className="text-xs text-slate-400 text-center italic py-4">No faculty profiles yet.</p>
                                    )}
                                </div>
                            </section>

                            {/* Quick tab CTAs */}
                            <div className="grid grid-cols-3 gap-3">
                                {['Placements', 'Notices', 'Events'].map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)}
                                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center hover:shadow-md transition group">
                                        <p className="font-black text-slate-800 group-hover:text-primary transition text-xs">{tab}</p>
                                        <p className="text-slate-400 text-[10px] mt-0.5">view →</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ PLACEMENTS TAB ═══ */}
                {activeTab === 'Placements' && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-800">Placement Records</h2>
                        </div>

                        {tabLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-slate-100 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : placements.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                                <p className="text-xl">📭 No placement data available yet.</p>
                                <p className="text-sm mt-2">Check back after our next recruitment cycle.</p>
                            </div>
                        ) : (
                            <>
                                {/* Summary bar */}
                                {(() => {
                                    const totalPlaced = placements.reduce((s, p) => s + p.studentsPlaced, 0);
                                    const maxPkg = Math.max(...placements.map(p => p.package));
                                    const avgPkg = (placements.reduce((s, p) => s + p.package, 0) / placements.length).toFixed(1);
                                    const companies = placements.length;
                                    return (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Total Placed', val: totalPlaced },
                                                { label: 'Companies', val: companies },
                                                { label: 'Highest LPA', val: `${maxPkg} LPA` },
                                                { label: 'Avg Package', val: `${avgPkg} LPA` },
                                            ].map((s, i) => (
                                                <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center">
                                                    <p className={`text-3xl font-black bg-gradient-to-r ${accentGrad} bg-clip-text text-transparent`}>{s.val}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{s.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}

                                {/* Cards grid */}
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl">
                                    <h3 className="text-white font-black text-lg mb-6">Recruiter Highlights</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {placements.map(p => (
                                            <div key={p._id} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition">
                                                {p.logoUrl && (
                                                    <img src={p.logoUrl} alt={p.companyName}
                                                        className="w-10 h-10 object-contain mx-auto mb-3 opacity-80"
                                                        onError={e => { e.target.style.display = 'none'; }} />
                                                )}
                                                <p className="text-2xl font-black text-white">{p.studentsPlaced}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-tight">{p.companyName}</p>
                                                <p className="text-emerald-400 text-xs font-bold mt-1">{p.package} LPA</p>
                                                <span className={`mt-2 inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                    p.type === 'on-campus' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                                                }`}>{p.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ═══ FACULTY TAB ═══ */}
                {activeTab === 'Faculty' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-slate-800">Department Faculty</h2>
                            <Link to={`/faculty?dept=${encodeURIComponent(dept.name)}`} className="text-sm text-primary hover:underline font-bold">View all →</Link>
                        </div>
                        {faculty.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {faculty.map(f => (
                                    <Link key={f._id} to={`/faculty/${f._id}`}
                                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center hover:shadow-lg hover:border-primary/20 transition group">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accentGrad} flex items-center justify-center mx-auto mb-3 text-white font-black text-xl group-hover:scale-105 transition`}>
                                            {f.name?.[0] || '?'}
                                        </div>
                                        <p className="font-bold text-slate-800 text-sm">{f.name}</p>
                                        <p className="text-slate-500 text-xs mt-0.5">{f.designation}</p>
                                        {f.specialization && <p className="text-primary text-xs mt-1 font-medium">{f.specialization}</p>}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                                <p className="text-lg">No faculty listed yet.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ NOTICES TAB ═══ */}
                {activeTab === 'Notices' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-slate-800">Department Notices</h2>
                            <Link to={`/notices?dept=${encodeURIComponent(dept.name)}`} className="text-sm text-primary hover:underline font-bold">View all →</Link>
                        </div>
                        {tabLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : notices.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {notices.map(n => (
                                    <div key={n._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition">
                                        <span className="text-[10px] bg-primary/10 text-primary font-black uppercase tracking-widest px-2.5 py-1 rounded-full">{n.category || 'Notice'}</span>
                                        <h3 className="font-bold text-slate-800 mt-3 mb-1 text-sm line-clamp-2">{n.title}</h3>
                                        <p className="text-slate-500 text-xs line-clamp-2">{n.content}</p>
                                        <p className="text-slate-400 text-[10px] font-bold mt-3">
                                            {new Date(n.createdAt || n.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                                <p className="text-lg">No notices for this department yet.</p>
                                <Link to="/notices" className="mt-3 inline-block text-sm text-primary hover:underline">Browse all notices</Link>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ EVENTS TAB ═══ */}
                {activeTab === 'Events' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-slate-800">Department Events</h2>
                            <Link to="/events" className="text-sm text-primary hover:underline font-bold">View all →</Link>
                        </div>
                        {tabLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-2xl" />)}
                            </div>
                        ) : events.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {events.map(e => (
                                    <div key={e._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition">
                                        <span className="text-[10px] bg-accent/10 text-accent font-black uppercase tracking-widest px-2.5 py-1 rounded-full">{e.type || 'Event'}</span>
                                        <h3 className="font-bold text-slate-800 mt-3 mb-1 text-sm">{e.title}</h3>
                                        <p className="text-slate-500 text-xs line-clamp-2">{e.description}</p>
                                        <p className="text-primary text-xs font-bold mt-3">
                                            {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
                                <p className="text-lg">No events for this department yet.</p>
                                <Link to="/events" className="mt-3 inline-block text-sm text-primary hover:underline">Browse all events</Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepartmentDetail;
