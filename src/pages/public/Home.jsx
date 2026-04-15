import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NoticeCard from '../../components/NoticeCard';
import InteractiveMap from '../../components/InteractiveMap';
import collegemain from '../../assets/collegemain.jpg';
import api from '../../utils/axios';
import usePageTitle from '../../utils/usePageTitle';
import AnnouncementTicker from '../../components/AnnouncementTicker';

/* ── Global Campus Bulletin Data ── */


const Home = () => {
    const [collegeNotices, setCollegeNotices] = useState([]);
    const [gtuCirculars, setGtuCirculars] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    usePageTitle('Home');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [collegeNoticesRes, gtuCircularsRes, eventsRes] = await Promise.all([
                    api.get('/notices?page=1&limit=3&excludeSource=GTU'),
                    api.get('/notices?page=1&limit=3&source=GTU'),
                    api.get('/events?page=1&limit=3')
                ]);
                setCollegeNotices(collegeNoticesRes.data.data || []);
                setGtuCirculars(gtuCircularsRes.data.data || []);
                setEvents(eventsRes.data.data || []);
            } catch (error) {
                console.error('Error fetching home data:', error);
                setCollegeNotices([]);
                setGtuCirculars([]);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="animate-fade-in bg-slate-50/30">
            <AnnouncementTicker department="All" />

            {/* ═══════ HERO BANNER ═══════ */}
            <section className="relative">
                <div className="w-full h-[500px] md:h-[650px] overflow-hidden">
                    <img src={collegemain} alt="Vishwakarma Government Engineering College" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                </div>

                {/* Hero Text */}
                <div className="absolute min-h-full inset-0 flex flex-col justify-center px-4 md:px-12 pointer-events-none">
                    <div className="max-w-3xl pointer-events-auto">
                        <span className="bg-accent text-slate-900 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6 inline-block shadow-xl">Chandkheda, Ahmedabad</span>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-6 drop-shadow-2xl">
                            Vishwakarma <br />
                            <span className="text-accent underline decoration-8 underline-offset-[12px] decoration-white/10">Government</span> Engineering
                        </h1>
                        <p className="text-white/70 text-lg md:text-xl font-medium max-w-xl mb-10 drop-shadow-md">
                            Empowering the next generation of engineers through innovation, research, and technical excellence since 1994.
                        </p> 

                        <div className="flex flex-wrap gap-4">
                            <Link to="https://www.vgecg.ac.in/admissions.php" className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent transition transform hover:-translate-y-1 shadow-2xl">
                                Admission 2026
                            </Link>
                            <Link to="https://www.vgecg.ac.in/" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition transform hover:-translate-y-1">
                                Discover VGEC
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ INTERACTIVE CAMPUS NAVIGATOR ═══════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 mb-12 relative z-20">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900">Interactive Campus Map</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Click a building to explore its department</p>
                </div>
                <InteractiveMap />
            </section>

            {/* ═══════ GLOBAL CAMPUS BULLETIN (News & Events) ═══════ */}
            {/* <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12"> */}
                    {/* Live Announcements / News */}
                    {/* <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900">News & Highlights</h2>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Institutional Pulse</p>
                            </div>
                            <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            {newsItems.map((news, i) => (
                                <div key={i} className="flex items-start space-x-4 group cursor-default">
                                    <span className="text-2xl mt-1 shrink-0 filter grayscale group-hover:grayscale-0 transition">{news.icon}</span>
                                    <div className="pb-6 border-b border-slate-50 last:border-0 w-full">
                                        <p className="text-sm font-bold text-slate-700 leading-relaxed group-hover:text-primary transition">{news.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link to="/notices" className="mt-8 text-center py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-primary hover:text-white transition">
                            Explore All Updates
                        </Link>
                    </div> */}

                    {/* Upcoming Talks & Events */}
                    {/* <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl shadow-slate-900/20 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl"></div>

                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h2 className="text-3xl font-black text-white">Talks & Events</h2>
                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Academic & Technical Calendar</p>
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center animate-pulse">
                                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                        </div>

                        <div className="space-y-8 relative z-10">
                            {events.map((event, i) => {
                                const eventDate = new Date(event.date);
                                const day = eventDate.getDate().toString().padStart(2, '0');
                                const month = eventDate.toLocaleString('default', { month: 'short' });
                                return (
                                    <div key={event._id || i} className="flex items-center space-x-6 group cursor-pointer">
                                        <div className="flex flex-col items-center justify-center w-16 h-16 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-accent group-hover:border-accent group-hover:text-slate-900 transition-all duration-300">
                                            <span className="text-xl font-black">{day}</span>
                                            <span className="text-[10px] font-bold uppercase">{month}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm leading-snug group-hover:text-accent transition truncate">{event.title}</h4>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{event.time}</span>
                                                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest truncate">{event.organizer || event.department}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {events.length === 0 && !loading && (
                                <p className="text-sm text-slate-400 italic">No upcoming events scheduled.</p>
                            )}
                        </div>

                        <Link to="/events" className="mt-12 block text-center py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-accent hover:text-slate-900 hover:border-accent transition">
                            View Full Event Stream
                        </Link>
                    </div>
                </div>
            </section> */}

            {/* ═══════ LATEST NOTICES (Horizontal Feed) ═══════ */}
            <section className="bg-white py-24 mb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900">Institute Notice Board</h2>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Latest College Notices</p>
                        </div>
                        <Link to="/notices" className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition">
                            View Archive
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {collegeNotices.length > 0 ? (
                                collegeNotices.map(notice => <NoticeCard key={notice._id} notice={notice} />)
                            ) : (
                                <div className="col-span-3 text-center py-12 text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-3xl">No college notices found. Check back later.</div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-white py-24 mb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900">GTU Circulars</h2>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Latest Official GTU Circulars</p>
                        </div>
                        <Link to="/gtu-circulars" className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition">
                            View Archive
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {gtuCirculars.length > 0 ? (
                                gtuCirculars.map(circular => <NoticeCard key={circular._id} notice={circular} />)
                            ) : (
                                <div className="col-span-3 text-center py-12 text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-3xl">No GTU circulars found. Check back later.</div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════ CORE VALUES SECTION ═══════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-slate-100">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black text-slate-900">Built for Quality</h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Our Pillars of Excellence</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="text-center group">
                        <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mb-8 mx-auto group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-xl shadow-primary/5">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Infrastructure</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                            Modernized labs, campus-wide fiber connectivity, and high-tech library systems.
                        </p>
                    </div>
                    <div className="text-center group">
                        <div className="w-20 h-20 bg-accent/10 rounded-[2rem] flex items-center justify-center mb-8 mx-auto group-hover:bg-accent group-hover:text-slate-900 transition-all duration-500 shadow-xl shadow-accent/5">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 01-12 0v1z" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Academic Depth</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                            12 UG Departments offering rigorous technical education affiliated with GTU.
                        </p>
                    </div>
                    <div className="text-center group">
                        <div className="w-20 h-20 bg-orange-50 rounded-[2rem] flex items-center justify-center mb-8 mx-auto group-hover:bg-orange-500 group-hover:text-white transition-all duration-500 shadow-xl shadow-orange-500/5">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Innovation Hub</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
                            Proactive participation in national hackathons and industry research projects.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════ STATS BAR ═══════ */}
            <section className="bg-primary py-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {[
                            { val: '1994', label: 'Established' },
                            { val: '12', label: 'UG Branches' },
                            { val: '5000+', label: 'Total Students' },
                            { val: 'A Grade', label: 'NAAC Accredited' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <p className="text-4xl md:text-5xl font-black text-accent mb-2">{stat.val}</p>
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
