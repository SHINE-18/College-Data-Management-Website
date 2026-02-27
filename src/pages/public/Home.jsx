import { Link } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import NoticeCard from '../../components/NoticeCard';
import DepartmentCard from '../../components/DepartmentCard';

const stats = [
    { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'Faculty Members', value: '248', color: 'bg-primary' },
    { icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', label: 'Students', value: '4,200', color: 'bg-accent' },
    { icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', label: 'Departments', value: '6', color: 'bg-emerald-500' },
    { icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', label: 'Publications', value: '1,850', color: 'bg-purple-500' },
];

const notices = [
    { id: 1, title: 'Mid-Semester Examination Schedule Released', category: 'Exam', date: 'Feb 20, 2026', content: 'The mid-semester examination schedule for all departments has been published. Students are requested to check the updated timetable.', postedBy: 'Examination Cell', attachment: true },
    { id: 2, title: 'New Admission Guidelines 2026-27', category: 'Admission', date: 'Feb 18, 2026', content: 'Applications are invited for admission to undergraduate and postgraduate programs for the academic year 2026-27.', postedBy: 'Admission Office', attachment: true },
    { id: 3, title: 'Annual Cultural Fest — Euphoria 2026', category: 'Events', date: 'Feb 15, 2026', content: 'Annual cultural festival will be held from March 15-17. All students are encouraged to participate in various events.', postedBy: 'Cultural Committee', attachment: false },
    { id: 4, title: 'Holiday Notice — Republic Day', category: 'General', date: 'Feb 12, 2026', content: 'The college will remain closed on January 26, 2026, on the occasion of Republic Day.', postedBy: 'Principal Office', attachment: false },
    { id: 5, title: 'Workshop on Machine Learning', category: 'Events', date: 'Feb 10, 2026', content: 'A 3-day workshop on Machine Learning and AI will be conducted by the CSE department in collaboration with IIT Bombay.', postedBy: 'CSE Department', attachment: true },
];

const events = [
    { id: 1, title: 'National Conference on AI & Robotics', date: 'Mar 5-7, 2026', description: 'Two-day national conference featuring keynote speakers from top universities.', department: 'CSE' },
    { id: 2, title: 'Industry Connect — Campus Placement Drive', date: 'Mar 12, 2026', description: 'Major tech companies visiting campus for recruitment. Over 50 companies expected.', department: 'Placement Cell' },
    { id: 3, title: 'Annual Sports Meet 2026', date: 'Mar 20-22, 2026', description: 'Inter-department sports competition featuring athletics, basketball, cricket, and more.', department: 'Sports Committee' },
];

const departments = [
    { id: 'cse', name: 'Computer Science & Engineering', code: 'CSE', description: 'Leading the way in computing, AI, and software development.', hodName: 'Dr. Rajesh Kumar', studentCount: 820 },
    { id: 'ece', name: 'Electronics & Communication', code: 'ECE', description: 'Excellence in electronics, VLSI design, and communication systems.', hodName: 'Dr. Priya Sharma', studentCount: 680 },
    { id: 'me', name: 'Mechanical Engineering', code: 'ME', description: 'Innovation in design, manufacturing, and thermal engineering.', hodName: 'Dr. Suresh Patel', studentCount: 720 },
    { id: 'ce', name: 'Civil Engineering', code: 'CE', description: 'Building the future with sustainable infrastructure and design.', hodName: 'Dr. Anita Singh', studentCount: 540 },
    { id: 'ee', name: 'Electrical Engineering', code: 'EE', description: 'Powering innovation in electrical systems and renewable energy.', hodName: 'Dr. Vikram Reddy', studentCount: 620 },
    { id: 'it', name: 'Information Technology', code: 'IT', description: 'Shaping the digital world with cutting-edge IT solutions.', hodName: 'Dr. Meena Gupta', studentCount: 780 },
];

const achievements = [
    { title: 'NAAC A++ Accreditation', description: 'Our institution received the prestigious NAAC A++ grade, reflecting our commitment to academic excellence.' },
    { title: 'Top 50 Engineering Colleges', description: 'Ranked among the top 50 engineering colleges in India by NIRF 2025.' },
    { title: '95% Placement Record', description: 'Achieved an outstanding 95% placement rate with an average package of ₹12 LPA.' },
    { title: '200+ Research Papers', description: 'Faculty and students published over 200 research papers in Scopus-indexed journals this year.' },
];

const Home = () => (
    <div className="animate-fade-in">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary via-primary-800 to-accent overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-8 border border-white/20">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        NAAC A++ Accredited Institution
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                        Empowering Minds,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">Shaping Futures</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                        A premier institution dedicated to academic excellence, innovation, and holistic development. Join us in building tomorrow's leaders.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/departments" className="bg-white text-primary font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-100 transition shadow-xl shadow-black/10 text-sm">
                            Explore Departments
                        </Link>
                        <Link to="/faculty" className="bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition border border-white/20 text-sm">
                            Meet Our Faculty
                        </Link>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
        </section>

        {/* Stats Bar */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                ))}
            </div>
        </section>

        {/* Latest Notices */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Latest Notices</h2>
                    <p className="text-gray-500 text-sm mt-1">Stay updated with important announcements</p>
                </div>
                <Link to="/notices" className="text-accent font-medium text-sm hover:text-accent-600 transition flex items-center space-x-1">
                    <span>View All</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {notices.slice(0, 5).map(notice => (
                    <NoticeCard key={notice.id} notice={notice} />
                ))}
            </div>
        </section>

        {/* Upcoming Events */}
        <section className="bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                        <p className="text-gray-500 text-sm mt-1">Don't miss out on exciting happenings</p>
                    </div>
                    <Link to="/events" className="text-accent font-medium text-sm hover:text-accent-600 transition flex items-center space-x-1">
                        <span>View All</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {events.map(event => (
                        <div key={event.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                            <div className="flex items-center space-x-2 mb-4">
                                <span className="bg-accent/10 text-accent text-xs font-semibold px-3 py-1 rounded-full">{event.department}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition">{event.title}</h3>
                            <p className="text-sm text-gray-500 mb-4">{event.description}</p>
                            <div className="flex items-center space-x-2 text-sm text-accent font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>{event.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Featured Departments */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900">Our Departments</h2>
                <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">Explore our diverse range of academic departments, each dedicated to excellence in education and research</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map(dept => (
                    <DepartmentCard key={dept.id} department={dept} />
                ))}
            </div>
        </section>

        {/* Achievements */}
        <section className="bg-primary py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-white">Achievements & Highlights</h2>
                    <p className="text-blue-200 text-sm mt-2">Our commitment to excellence speaks through results</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {achievements.map((a, i) => (
                        <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-300">
                            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mb-4">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">{a.title}</h3>
                            <p className="text-sm text-blue-200 leading-relaxed">{a.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </div>
);

export default Home;
