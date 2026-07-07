import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import vgec_hd from '../assets/vgec_hd.png';
import { DEPARTMENT_DETAILS } from '../constants/departments';
import NotificationBell from './NotificationBell';
// import GlobalSearch from './GlobalSearch';

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const [peopleOpen, setPeopleOpen] = useState(false);
    const [academicsOpen, setAcademicsOpen] = useState(false);
    const [visible, setVisible] = useState(true);
    const lastScrollY = useRef(0);
    const { isAuthenticated, role, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    // Detect department from either query param (?dept=...) or path (/department/:id)
    const getActiveDept = () => {
        const deptParam = queryParams.get('dept');
        if (deptParam) return deptParam;

        if (location.pathname.startsWith('/department/')) {
            const deptId = location.pathname.split('/').pop();
            const deptObj = DEPARTMENT_DETAILS.find(d => d.id === deptId);
            return deptObj ? deptObj.name : null;
        }
        return null;
    };

    const activeDept = getActiveDept();

    const peopleRef = useRef(null);
    const academicsRef = useRef(null);

    const portalLink = role === 'super_admin' ? '/admin/dashboard' : role === 'hod' ? '/hod/dashboard' : '/faculty-portal/dashboard';

    // Helper to generate links with current department context
    const getDeptLink = (path) => activeDept ? `${path}?dept=${encodeURIComponent(activeDept)}` : path;

    // ... (rest of the file)

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (peopleRef.current && !peopleRef.current.contains(e.target)) setPeopleOpen(false);
            if (academicsRef.current && !academicsRef.current.contains(e.target)) setAcademicsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Hide navbar on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentY = window.scrollY;
            const delta = currentY - lastScrollY.current;

            // Dead-zone of 8px to avoid jitter on small scrolls
            if (Math.abs(delta) < 8) return;

            if (currentY > 80 && delta > 0) {
                // Scrolling DOWN past 80px — hide
                setVisible(false);
                setOpen(false); // also close mobile menu
            } else {
                // Scrolling UP or near top — show
                setVisible(true);
            }
            lastScrollY.current = currentY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => location.pathname === path;

    const mobileNavLinks = [
        { path: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { path: '/faculty', label: 'Faculty', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', useDept: true },
        { path: '/notices', label: 'Notices', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9', useDept: true },
        { path: '/gtu-circulars', label: 'GTU Circulars', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', useDept: true },
        { path: '/timetable', label: 'Timetable', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', useDept: true },
        { path: '/events', label: 'Events', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', useDept: true },
        { path: '/syllabi', label: 'Syllabus Archive', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', useDept: true },
        { path: '/calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', useDept: true }
    ];

    return (
        <header
            className={`sticky top-0 z-50 shadow-lg transition-transform duration-300 ease-in-out ${
                visible ? 'translate-y-0' : '-translate-y-full'
            }`}
        >

            <div className="bg-primary-700 text-white">
                <div className="px-3 sm:px-6 lg:px-8 flex justify-between items-center h-7 text-xs">
                    <span className="font-medium tracking-wide truncate max-w-[60%] sm:max-w-none">
                        <span className="hidden sm:inline">Vishwakarma Government Engineering College, Ahmedabad</span>
                        <span className="sm:hidden">VGEC, Ahmedabad</span>
                    </span>
                    <div className="flex items-center space-x-2 sm:space-x-4 text-primary-200 shrink-0">
                        <span className="hidden xs:inline">GTU Affiliated</span>
                        <span className="hidden sm:inline">•</span>
                        <span>AICTE Approved</span>
                    </div>
                </div>
            </div>


            <div className="bg-white border-b border-gray-200">
                <div className="px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                        <img src={vgec_hd} alt="VGEC Logo" className="w-10 h-10 sm:w-14 sm:h-14 object-contain shrink-0" />
                        <div className="min-w-0">
                            <h1 className="font-heading font-bold text-sm sm:text-lg md:text-xl text-gray-900 uppercase tracking-wide leading-tight truncate">
                                {activeDept ? `Department of ${activeDept}` : 'VGEC Department Portal'}
                            </h1>
                            <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 font-medium tracking-wider uppercase truncate">
                                Vishwakarma Govt. Engineering College
                            </p>
                        </div>
                    </Link>
                    {/* Right side: search + notification + dark mode + login */}
                    <div className="hidden lg:flex items-center gap-2">
                        {/* <GlobalSearch /> */}
                        {isAuthenticated && <NotificationBell />}
                        {/* Dark mode toggle */}
                        {/* <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            aria-label="Toggle dark mode"
                            id="dark-mode-toggle"
                        >
                            {isDark ? (
                                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="currentColor" fill="none" />
                                </svg>
                            ) : (
                                <svg className="w-4.5 h-4.5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                                </svg>
                            )}
                        </button> */}
                        <div className="relative ml-1">
                            {isAuthenticated ? (
                                <>
                                    <Link to={portalLink} className="bg-primary text-white text-sm font-semibold px-5 py-2 mr-2 rounded-lg hover:bg-blue-900 transition">Dashboard</Link>
                                    <button onClick={logout} className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-900 transition">Logout</button>
                                </>
                            ) : (
                                <Link to="/login" className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-900 transition block text-center">Login</Link>
                            )}
                        </div>
                    </div>
                    {/* Mobile menu button */}
                    <button onClick={() => setOpen(!open)} className="lg:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition" id="mobile-menu-btn">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {open ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Tier 3: Navigation Bar () */}
            <nav className="bg-primary-700 hidden lg:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center space-x-1 h-11">
                        <Link to="/" className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition ${isActive('/') ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}>
                            Home
                        </Link>

                        {/* People Dropdown
                        <div ref={peopleRef} className="relative" onMouseEnter={() => setPeopleOpen(true)} onMouseLeave={() => setPeopleOpen(false)}>
                            <button
                                className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition flex items-center space-x-1 ${isActive('/faculty') ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}
                            >
                                <span>Faculty</span>
                                <svg className={`w-3 h-3 transition-transform ${peopleOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {peopleOpen && (
                                <div className="absolute top-full left-0 mt-0 bg-white shadow-xl rounded-b-lg border border-gray-200 min-w-[180px] z-50 animate-slide-down">
                                    <Link to={getDeptLink("/faculty")} onClick={() => setPeopleOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary hover:text-white transition">Faculty</Link>
                                </div>
                            )}
                        </div> */}

                        {/* Academics Dropdown */}
                        <div ref={academicsRef} className="relative" onMouseEnter={() => setAcademicsOpen(true)} onMouseLeave={() => setAcademicsOpen(false)}>
                            <button
                                className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition flex items-center space-x-1 ${(isActive('/timetable') || isActive('/calendar') || isActive('/syllabi')) ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}
                            >
                                <span>Academics</span>
                                <svg className={`w-3 h-3 transition-transform ${academicsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {academicsOpen && (
                                <div className="absolute top-full left-0 mt-0 bg-white shadow-xl rounded-b-lg border border-gray-200 min-w-[200px] z-50 animate-slide-down">
                                    <Link to={getDeptLink("/timetable")} onClick={() => setAcademicsOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary hover:text-white transition">Timetable</Link>
                                    <Link to={getDeptLink("/calendar")} onClick={() => setAcademicsOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary hover:text-white transition">Academic Calendar</Link>
                                    <Link to={getDeptLink("/syllabi")} onClick={() => setAcademicsOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary hover:text-white transition">Syllabus Archive</Link>
                                </div>
                            )}
                        </div>

                        <Link to={getDeptLink("/events")} className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition ${isActive('/events') ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}>
                            Events
                        </Link>
                        <Link to={getDeptLink("/notices")} className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition ${isActive('/notices') ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}>
                            Notices
                        </Link>
                        <Link to={getDeptLink("/gtu-circulars")} className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition ${isActive('/gtu-circulars') ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}>
                            GTU Circulars
                        </Link>
                        {/* <Link to="/placements" className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition ${isActive('/placements') ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}>
                            Placements
                        </Link>
                        <Link to="/feedback" className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition ${isActive('/feedback') ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}>
                            Feedback
                        </Link> */}

                        {isAuthenticated && (
                            <Link to={portalLink} className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition text-primary-100 hover:bg-white/10 hover:text-white`}>
                                Internal
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {open && (
                <div className="lg:hidden bg-white border-t border-gray-200 animate-slide-down shadow-2xl max-h-[85vh] overflow-y-auto">
                    <div className="px-4 py-5 space-y-1">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {mobileNavLinks.map((link, idx) => {
                                const active = isActive(link.path);
                                const toPath = link.useDept ? getDeptLink(link.path) : link.path;
                                return (
                                    <Link 
                                        key={idx}
                                        to={toPath} 
                                        onClick={() => setOpen(false)} 
                                        className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all duration-200 ${
                                            active 
                                                ? 'bg-primary/5 border-primary/20 text-primary shadow-sm' 
                                                : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-200 hover:shadow-sm'
                                        }`}
                                    >
                                        <svg className={`w-6 h-6 mb-2 transition-transform duration-200 ${active ? 'text-primary scale-110' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                                        </svg>
                                        <span className="text-[11px] font-bold text-center leading-tight tracking-wide">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="pt-5 border-t border-gray-100 space-y-3">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center px-2 py-1 mb-3">
                                        <NotificationBell />
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-bold text-gray-900">Notifications</p>
                                            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Manage your alerts</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link 
                                            to={portalLink} 
                                            onClick={() => setOpen(false)} 
                                            className="flex flex-col items-center justify-center p-3 bg-primary text-white rounded-2xl shadow-md shadow-primary/20 hover:bg-primary-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                        >
                                            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                            <span className="text-[11px] font-bold tracking-wide">Dashboard</span>
                                        </Link>
                                        <button 
                                            onClick={() => { logout(); setOpen(false); }} 
                                            className="flex flex-col items-center justify-center p-3 text-red-600 bg-red-50 border border-red-100 rounded-2xl hover:bg-red-100 hover:border-red-200 hover:shadow-sm transition-all duration-200"
                                        >
                                            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                            <span className="text-[11px] font-bold tracking-wide">Logout</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <Link 
                                    to="/login" 
                                    onClick={() => setOpen(false)} 
                                    className="flex items-center justify-center space-x-3 w-full p-4 bg-primary text-white rounded-2xl font-bold tracking-wide hover:bg-primary-600 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Faculty Login</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
