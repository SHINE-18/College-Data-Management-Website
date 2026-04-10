import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FacultyCard from '../../components/FacultyCard';
import { DEPARTMENT_DETAILS } from '../../constants/departments';
import api from '../../utils/axios';
import { useState } from 'react';
import AnnouncementTicker from '../../components/AnnouncementTicker';

const DepartmentDetail = () => {
    const { id } = useParams();
    const [faculty, setFaculty] = useState([]);
    const [dept, setDept] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Find department name/code from constants to guide the API search
                const deptConst = DEPARTMENT_DETAILS.find(d => d.id === id) || { code: id };

                // Fetch department details
                const deptRes = await api.get(`/departments/search?code=${deptConst.code}`);
                const currentDept = deptRes.data.data;
                setDept(currentDept);

                if (currentDept) {
                    // Fetch faculty for this department
                    const facRes = await api.get(`/faculty?department=${encodeURIComponent(currentDept.name)}&limit=6`);
                    setFaculty(facRes.data.data);
                }
            } catch (error) {
                console.error('Error fetching department details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

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

    return (
        <div className="animate-fade-in pb-20 bg-slate-50/50">
            <AnnouncementTicker department={dept.name} />
            {/* ═══════ HERO SECTION ═══════ */}
            <div className="bg-primary-700 relative overflow-hidden py-24">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/10 skew-x-[-15deg] translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex items-center space-x-3 text-primary-200 text-xs font-bold uppercase tracking-widest mb-6">
                        <Link to="/" className="hover:text-white transition">VGEC</Link>
                        <span>/</span>
                        <span className="text-white">Department Hub</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
                        Department of <br />
                        <span className="text-accent">{dept.name}</span>
                    </h1>
                    <p className="text-primary-100/80 text-lg max-w-2xl font-medium leading-relaxed">
                        {dept.description}
                    </p>

                    <div className="mt-10 flex flex-wrap gap-4">
                        <Link to={`/notices?dept=${encodeURIComponent(dept.name)}`} className="bg-white text-primary px-8 py-3 rounded-xl font-bold hover:bg-primary-50 transition shadow-xl flex items-center">
                            Notice Board
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </Link>
                        <Link to={`/faculty?dept=${encodeURIComponent(dept.name)}`} className="bg-primary-600/50 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-xl font-bold hover:bg-primary-600 transition">
                            Meet Faculty
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
                {/* Stats Bar if available */}
                {dept.stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {dept.stats.map((stat, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 text-center border border-slate-100 flex flex-col justify-center">
                                <p className="text-3xl font-black text-primary">{stat.val}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ═══════ LEFT COLUMN ═══════ */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Section if available */}
                        {dept.detailAbout && (
                            <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6 flex items-center">
                                    <span className="w-1.5 h-6 bg-primary rounded-full mr-3"></span>
                                    About the Department
                                </h2>
                                <p className="text-slate-600 leading-relaxed font-medium">
                                    {dept.detailAbout}
                                </p>
                            </section>
                        )}

                        {/* HOD Message Card */}
                        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:text-primary/10 transition">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11.5L13.017 11.5L13.017 9C13.017 7.89543 13.9124 7 15.017 7H19.017C20.1216 7 21.017 7.89543 21.017 9V15C21.017 18.3137 18.3307 21 15.017 21L14.017 21ZM5.017 21L5.017 18C5.017 16.8954 5.91243 16 7.017 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.017C5.46472 8 5.017 8.44772 5.017 9V11.5L4.017 11.5L4.017 9C4.017 7.89543 4.91243 7 6.017 7H10.017C11.1216 7 12.017 7.89543 12.017 9V15C12.017 18.3137 9.33071 21 6.017 21L5.017 21Z" /></svg>
                            </div>

                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                <div className="w-48 h-56 shrink-0 relative">
                                    <div className="absolute inset-0 bg-primary/10 rounded-2xl rotate-3"></div>
                                    <div className="absolute inset-0 bg-accent/20 rounded-2xl -rotate-3"></div>
                                    <div className="relative w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border-4 border-white text-4xl text-white font-black">
                                        {dept.hod?.name ? dept.hod.name[0] : 'H'}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{dept.hod?.name || 'Unassigned'}</h2>
                                        <p className="text-accent font-bold text-xs uppercase tracking-widest">Head of Department</p>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed italic text-lg font-medium">
                                        "{dept.hod?.message || 'Welcome to our department. We are dedicated to nurturing excellence.'}"
                                    </p>
                                    <div className="pt-4 flex items-center space-x-3">
                                        <div className="w-10 h-[2px] bg-slate-200"></div>
                                        <span className="text-xs text-slate-400 font-bold uppercase">Visionary Leadership</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Research Areas if available */}
                        {dept.researchAreas && (
                            <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-8 flex items-center">
                                    <span className="w-1.5 h-6 bg-accent rounded-full mr-3"></span>
                                    Research Horizons
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {dept.researchAreas.map((area, i) => (
                                        <div key={i} className="group p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-primary/20 hover:shadow-xl transition-all duration-300">
                                            <h4 className="font-bold text-primary mb-4 group-hover:text-accent transition">{area.title}</h4>
                                            <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-slate-400">
                                                <span>{area.faculty} FACULTY</span>
                                                <span>{area.projects} PROJECTS</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Vision & Mission Grid */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-primary text-white rounded-3xl p-8 shadow-xl shadow-primary/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </div>
                                <h3 className="text-xl font-black mb-3 flex items-center">
                                    <span>Vision</span>
                                </h3>
                                <p className="text-primary-100 font-medium leading-relaxed">{dept.vision}</p>
                            </div>
                            <div className="bg-white text-slate-800 border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
                                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <h3 className="text-xl font-black text-primary mb-3">Mission</h3>
                                <p className="text-slate-500 font-medium leading-relaxed">{dept.mission}</p>
                            </div>
                        </section>

                        {/* Placement Section if available */}
                        {dept.placementStats && (
                            <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                                    <div>
                                        <h2 className="text-2xl font-black text-white tracking-tight">Placement Statistics</h2>
                                        <p className="text-slate-400 text-sm mt-1">Class of 2026 Recruitment Highlights</p>
                                    </div>
                                    <div className="bg-accent text-slate-900 px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest">
                                        Top Recruiters
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {dept.placementStats.map((p, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition">
                                            <p className="text-3xl font-black text-white">{p.count}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{p.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Achievements Highlights */}
                        <section className="bg-slate-50 rounded-3xl p-8 border border-slate-200/60">
                            <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center">
                                <span className="w-1.5 h-6 bg-accent rounded-full mr-3"></span>
                                Departmental Milestones
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dept.achievements.map((a, i) => (
                                    <div key={i} className="flex items-center space-x-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                                        <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                        </div>
                                        <p className="text-sm font-bold text-slate-600">{a}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* ═══════ RIGHT COLUMN: QUICK STATS & FACULTY ═══════ */}
                    <div className="space-y-8">
                        {/* Quick Access List */}
                        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 text-center">Resources</h3>
                            <div className="space-y-2">
                                {[
                                    { name: 'Syllabus Archive', path: `/syllabi?dept=${encodeURIComponent(dept.name)}`, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                                    { name: 'Branch Timetable', path: `/timetable?dept=${encodeURIComponent(dept.name)}`, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                                    { name: 'Faculty Directory', path: `/faculty?dept=${encodeURIComponent(dept.name)}`, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                                    { name: 'Branch Events', path: `/events?dept=${encodeURIComponent(dept.name)}`, icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
                                ].map((item, id) => (
                                    <Link key={id} to={item.path} className="flex items-center p-4 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 group">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                                        </div>
                                        <span className="ml-4 font-bold text-slate-600 transition group-hover:text-primary">{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Recent Faculty (Small Grid) */}
                        <section className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Department Faculty</h3>
                                <Link to={`/faculty?dept=${encodeURIComponent(dept.name)}`} className="text-xs font-bold text-accent hover:underline">See All</Link>
                            </div>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl"></div>)}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {faculty.slice(0, 3).map(f => (
                                        <div key={f._id} className="flex items-center space-x-4 p-2">
                                            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center shrink-0 border border-primary/10">
                                                <span className="text-primary font-bold text-xs">{f.name[0]}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-slate-800 truncate">{f.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{f.designation}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {faculty.length === 0 && <p className="text-xs text-slate-400 text-center italic py-4">No faculty profiles available yet.</p>}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentDetail;
