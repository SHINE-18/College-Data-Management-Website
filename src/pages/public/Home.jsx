import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NoticeCard from '../../components/NoticeCard';
import api from '../../utils/axios';
import heroBanner from '../../assets/hero_banner.png';
import campusBuilding from '../../assets/campus_building.png';
import hodPortrait from '../../assets/hod_portrait.png';
import researchAiMl from '../../assets/research_ai_ml.png';
import researchNetworks from '../../assets/research_networks.png';
import researchSoftware from '../../assets/research_software.png';

/* ── Real VGEC / GTU Events — Scraped 09-Mar-2026 ── */
const upcomingEvents = [
    { title: 'TECHNIX 2026 — Institute Technical Festival', date: '04-Feb-26 9:00 AM', department: 'VGEC' },
    { title: 'International Experience Program (IEP) 2026 — Australia', date: 'Apply by 07-Apr-26', department: 'GTU / CE' },
    { title: 'Expert Session: Career Paths for Engineers', date: '22-Mar-26 11:00 AM', department: 'CE' },
    { title: 'B-Plan Pitch Event: Showcase Your Startup Idea', date: '28-Mar-26 10:00 AM', department: 'CE / IIC' },
    { title: 'IP UTSAV & World Creativity Day Celebration', date: '21-Apr-26 10:00 AM', department: 'VGEC' },
];

const researchAreas = [
    { title: 'Artificial Intelligence & Machine Learning', image: researchAiMl, faculty: 4, projects: 12, courses: 6, color: 'bg-red-50 border-red-200' },
    { title: 'Computer Networks & Security', image: researchNetworks, faculty: 3, projects: 8, courses: 5, color: 'bg-teal-50 border-teal-200' },
    { title: 'Software Engineering & Web Technologies', image: researchSoftware, faculty: 3, projects: 10, courses: 7, color: 'bg-amber-50 border-amber-200' },
];

const talkEvents = [
    { day: '04', month: 'Feb', time: '09:00 AM', title: 'TECHNIX 2026 — Institute Technical Festival', speaker: 'Technical Committee, VGEC' },
    { day: '07', month: 'Apr', time: 'Deadline', title: 'International Experience Program (IEP) 2026 — Australia', speaker: 'GTU / Adelaide Campus' },
    { day: '22', month: 'Mar', time: '11:00 AM', title: 'Expert Session: Career Paths for Engineers', speaker: 'Industry Experts, CE Dept' },
];

const newsItems = [
    { icon: '🏆', title: 'TECHNIX 2026 — College-wide technical fest held on Feb 4, 2026' },
    { icon: '🌏', title: 'GTU announces International Experience Program at Adelaide, Australia for CE/IT students' },
    { icon: '🎓', title: '15th Annual GTU Convocation held on January 22, 2026' },
    { icon: '💡', title: 'B-Plan Pitch Event: CE students showcase startup ideas to industry mentors' },
    { icon: '🏗️', title: 'Network Operation Center upgraded with new fiber connectivity at VGEC' },
];

const placementCompanies = [
    { name: 'Bacancy Technology', count: 20 },
    { name: 'Simform Solutions', count: 14 },
    { name: 'einfochips Ltd', count: 14 },
    { name: 'eSparkBiz', count: 10 },
    { name: 'Tatva Soft', count: 7 },
    { name: 'TCS', count: 4 },
];

const Home = () => {
    const [notices, setNotices] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch notices and events from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch notices (3 most recent)
                const noticesRes = await api.get('/notices?page=1&limit=3');
                setNotices(noticesRes.data.data || []);

                // Fetch upcoming events
                const eventsRes = await api.get('/events?page=1&limit=5');
                setEvents(eventsRes.data.data || []);
            } catch (error) {
                console.error('Error fetching home data:', error);
                // Fallback to empty arrays - static data will show in events overlay
                setNotices([]);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Format event date for display
    const formatEventDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="animate-fade-in">
            {/* ═══════ SECTION 1: Hero Banner (IIT Bombay + IIT Madras) ═══════ */}
            <section className="relative">
                <div className="w-full h-[400px] md:h-[480px] overflow-hidden">
                    <img src={heroBanner} alt="VGEC Computer Engineering Department" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
                </div>
                {/* Events Overlay (IIT Madras-inspired) */}
                <div className="absolute top-4 right-4 md:top-8 md:right-8 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl w-80 md:w-96 max-h-[380px] overflow-hidden hidden md:block">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-heading font-bold text-primary text-lg">Upcoming Events & Seminars</h3>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[260px] overflow-y-auto events-scrollbar">
                        {events.length > 0 ? (
                            events.map((e, i) => (
                                <div key={e._id || i} className="p-4 hover:bg-cream transition">
                                    <p className="font-semibold text-gray-900 text-sm leading-snug">{e.title}</p>
                                    <div className="flex items-center mt-2 text-xs text-gray-500">
                                        <svg className="w-3.5 h-3.5 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {formatEventDate(e.date)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            upcomingEvents.map((e, i) => (
                                <div key={i} className="p-4 hover:bg-cream transition">
                                    <p className="font-semibold text-gray-900 text-sm leading-snug">{e.title}</p>
                                    <div className="flex items-center mt-2 text-xs text-gray-500">
                                        <svg className="w-3.5 h-3.5 mr-1 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {e.date}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="p-3 border-t border-gray-100 bg-gray-50">
                        <Link to="/events" className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition block text-center">
                            View More
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════ SECTION 2: Quick Access Cards () ═══════ */}
            <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {[
                        { icon: '🎓', label: 'Academics', to: '/timetable', desc: 'Timetable & Syllabus' },
                        { icon: '🔬', label: 'Research', to: '/faculty', desc: 'Faculty & Projects' },
                        { icon: '📋', label: 'Notices', to: '/notices', desc: 'Circulars & Updates' },
                        { icon: '📅', label: 'Calendar', to: '/calendar', desc: 'Academic Schedule' },
                    ].map((card, i) => (
                        <Link key={i} to={card.to} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 text-center group hover:-translate-y-1 border border-gray-100">
                            <span className="text-2xl block mb-2">{card.icon}</span>
                            <span className="font-heading font-bold text-gray-900 text-sm group-hover:text-primary transition">{card.label}</span>
                            <p className="text-xs text-gray-400 mt-1">{card.desc}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ═══════ SECTION 3: About the Department ═══════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    <div className="rounded-2xl overflow-hidden shadow-lg">
                        <img src={campusBuilding} alt="VGEC Computer Engineering Department Building" className="w-full h-72 md:h-80 object-cover" />
                    </div>
                    <div>
                        <h2 className="section-title mb-6">About the Department</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            The Department of Computer Engineering at Vishwakarma Government Engineering College was established in <strong>2001</strong> with an annual intake of <strong>120 students</strong>. The department is committed to creating an environment for providing value-based education through innovation, teamwork, and ethical practices.
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Affiliated to Gujarat Technological University (GTU) and approved by AICTE, the department offers a rigorous B.E. program that prepares students to meet the demands of industry, government, society, and the scientific community.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            With state-of-the-art computing facilities including specialized labs for Programming, Networking, OOP, Advance Computing, and a Network Operation Center, the department provides hands-on learning experiences that bridge theory and practice.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════ SECTION 4: HOD's Message  ═══════ */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div>
                            <h2 className="section-title mb-6">Message from the Head of Department</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Welcome to the Department of Computer Engineering at VGEC. Our department is dedicated to producing computer engineering graduates who are equipped to meet the demands of industry, government, and society.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                We focus on developing state-of-the-art computing facilities and academic infrastructure while building partnerships with industries, government agencies, and R&D organizations for knowledge sharing and overall development.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                Our vision is to create an environment for providing value-based education in Computer Engineering through innovation, teamwork, and ethical practices. I invite you to explore our department and discover the opportunities we offer.
                            </p>
                            <div className="flex items-center space-x-3">
                                <div className="w-1 h-12 bg-primary rounded-full"></div>
                                <div>
                                    <p className="font-heading font-bold text-gray-900">Prof. Kajal S. Patel</p>
                                    <p className="text-sm text-primary font-medium">Associate Professor & HOD</p>
                                    <p className="text-xs text-gray-500">Ph.D. — kajalpatel@vgecg.ac.in</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center lg:justify-end">
                            <div className="relative">
                                <div className="absolute -inset-3 bg-primary/10 rounded-2xl rotate-3"></div>
                                <img src={hodPortrait} alt="Prof. Kajal S. Patel — HOD, Computer Engineering" className="relative w-64 h-80 md:w-72 md:h-96 object-cover rounded-2xl shadow-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ SECTION 5: Research Areas  ═══════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="section-title mb-10">Research Areas</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {researchAreas.map((area, i) => (
                        <div key={i} className={`rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${area.color}`}>
                            <div className="h-44 overflow-hidden">
                                <img src={area.image} alt={area.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="p-5">
                                <h3 className="font-heading font-bold text-primary text-center mb-4">{area.title}</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { val: area.faculty, label: 'Faculty' },
                                        { val: area.projects, label: 'Projects' },
                                        { val: area.courses, label: 'Courses' },
                                    ].map((stat, j) => (
                                        <div key={j} className="text-center">
                                            <span className="font-heading font-bold text-2xl text-primary">{stat.val}</span>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════ SECTION 6: Events & News  ═══════ */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Talks & Events — */}
                        <div>
                            <h2 className="section-title mb-6">Talks & Events</h2>
                            <div className="space-y-4">
                                {events.length > 0 ? (
                                    events.slice(0, 3).map((event, i) => (
                                        <div key={event._id || i} className="flex rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group">
                                            <div className="bg-primary text-white w-20 shrink-0 flex flex-col items-center justify-center py-3">
                                                <span className="text-2xl font-bold leading-none">{new Date(event.date).getDate()}</span>
                                                <span className="text-xs uppercase mt-1">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                            </div>
                                            <div className="p-4 flex-1">
                                                <h4 className="font-semibold text-gray-900 text-sm group-hover:text-primary transition leading-snug">{event.title}</h4>
                                                <p className="text-xs text-gray-500 mt-2">Type: <span className="font-medium text-accent">{event.type}</span></p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    talkEvents.map((event, i) => (
                                        <div key={i} className="flex rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition group">
                                            <div className="bg-primary text-white w-20 shrink-0 flex flex-col items-center justify-center py-3">
                                                <span className="text-2xl font-bold leading-none">{event.day}</span>
                                                <span className="text-xs uppercase mt-1">{event.month}</span>
                                                <span className="text-[10px] text-primary-200 mt-1">{event.time}</span>
                                            </div>
                                            <div className="p-4 flex-1">
                                                <h4 className="font-semibold text-gray-900 text-sm group-hover:text-primary transition leading-snug">{event.title}</h4>
                                                <p className="text-xs text-gray-500 mt-2">Speaker: <span className="font-medium text-accent">{event.speaker}</span></p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <Link to="/events" className="inline-flex items-center mt-4 text-sm text-primary font-semibold hover:text-primary-700 transition">
                                more →
                            </Link>
                        </div>

                        {/* News — */}
                        <div>
                            <h2 className="section-title mb-6">News & Highlights</h2>
                            <div className="space-y-3">
                                {newsItems.map((news, i) => (
                                    <div key={i} className="flex items-start space-x-3 p-3 rounded-xl border border-gray-200 hover:shadow-md hover:border-primary/20 transition">
                                        <span className="text-xl shrink-0 mt-0.5">{news.icon}</span>
                                        <p className="text-sm text-gray-700 leading-relaxed">{news.title}</p>
                                    </div>
                                ))}
                            </div>
                            <Link to="/notices" className="inline-flex items-center mt-4 text-sm text-primary font-semibold hover:text-primary-700 transition">
                                more →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ SECTION 7: Latest Notices ═══════ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="section-title">Latest Notices</h2>
                    <Link to="/notices" className="text-primary font-medium text-sm hover:text-primary-700 transition flex items-center space-x-1">
                        <span>View All</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : notices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {notices.map(notice => (
                            <NoticeCard key={notice._id} notice={notice} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Fallback static notices if API fails */}
                        <NoticeCard notice={{ id: 1, title: 'Mid-Semester Examination Schedule Released', category: 'Exam', date: 'Feb 20, 2026', content: 'The mid-semester examination schedule for all departments has been published. Students are requested to check the updated timetable on GTU portal.', postedBy: 'Examination Cell', attachment: true }} />
                        <NoticeCard notice={{ id: 2, title: 'New Admission Guidelines 2026-27', category: 'Admission', date: 'Feb 18, 2026', content: 'Applications are invited for admission to B.E. Computer Engineering for the academic year 2026-27 through ACPC.', postedBy: 'Admission Office', attachment: true }} />
                        <NoticeCard notice={{ id: 3, title: 'Annual Cultural Fest — Euphoria 2026', category: 'Events', date: 'Feb 15, 2026', content: 'Annual cultural festival will be held from March 15-17. All students are encouraged to participate.', postedBy: 'Cultural Committee', attachment: false }} />
                    </div>
                )}
            </section>

            {/* ═══════ SECTION 8: Placement & Quick Stats (Stanford-inspired) ═══════ */}
            <section className="bg-primary-700 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="font-heading text-2xl font-bold text-white">Placement Highlights — Batch 2026</h2>
                        <p className="text-primary-200 text-sm mt-1">Our students are placed in top IT companies across India</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {placementCompanies.map((c, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10 hover:bg-white/20 transition">
                                <p className="font-heading font-bold text-2xl text-white">{c.count}</p>
                                <p className="text-xs text-primary-200 mt-1 leading-snug">{c.name}</p>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-white/10">
                        {[
                            { val: '10+', label: 'Faculty Members' },
                            { val: '120', label: 'Student Intake' },
                            { val: '6', label: 'Laboratories' },
                            { val: 'Est. 2001', label: 'Department Founded' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <p className="font-heading font-bold text-3xl text-white">{stat.val}</p>
                                <p className="text-sm text-primary-200 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

