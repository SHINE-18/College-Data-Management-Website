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
                <div className="lg:hidden bg-white border-t border-gray-200 animate-slide-down shadow-xl">
                    <div className="px-4 py-3 space-y-1">
                        <Link to="/" onClick={() => setOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive('/') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>🏠 Home</Link>
                        <Link to={getDeptLink("/faculty")} onClick={() => setOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive('/faculty') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>👨‍🏫 Faculty</Link>
                        <Link to={getDeptLink("/notices")} onClick={() => setOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive('/notices') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>📋 Notices</Link>
                        <Link to={getDeptLink("/gtu-circulars")} onClick={() => setOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive('/gtu-circulars') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>📜 GTU Circulars</Link>
                        <Link to={getDeptLink("/timetable")} onClick={() => setOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive('/timetable') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>🗓️ Timetable</Link>
                        <Link to={getDeptLink("/events")} onClick={() => setOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive('/events') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>🎉 Events</Link>
                        <Link to={getDeptLink("/syllabi")} onClick={() => setOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive('/syllabi') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>📚 Syllabus Archive</Link>
                        <Link to={getDeptLink("/calendar")} onClick={() => setOpen(false)} className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition ${isActive('/calendar') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>📅 Calendar</Link>

                        <div className="pt-3 border-t border-gray-200 space-y-2">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center px-3 py-2">
                                        <NotificationBell />
                                        <span className="ml-2 text-sm text-gray-600 font-medium">Notifications</span>
                                    </div>
                                    <Link to={portalLink} onClick={() => setOpen(false)} className="block px-3 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold text-center">Dashboard</Link>
                                    <button onClick={() => { logout(); setOpen(false); }} className="block w-full px-3 py-2.5 text-red-500 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition text-center">Logout</button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold text-center">Faculty Login</Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
