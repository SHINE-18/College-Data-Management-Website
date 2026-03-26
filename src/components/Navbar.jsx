import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import vgec_hd from '../assets/vgec_hd.png';
import { DEPARTMENT_DETAILS } from '../constants/departments';

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const [peopleOpen, setPeopleOpen] = useState(false);
    const [academicsOpen, setAcademicsOpen] = useState(false);
    const { isAuthenticated, role, logout } = useAuth();
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

    const isActive = (path) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 shadow-lg">

            <div className="bg-primary-700 text-white">
                <div className="max-w-9xl px-4 sm:px-6 lg:px-8 flex justify-between items-center h-7 text-xs">
                    <span className="font-medium tracking-wide">Vishwakarma Government Engineering College, Ahmedabad</span>
                    <div className="hidden sm:flex items-center space-x-4 text-primary-200">
                        <span>GTU Affiliated</span>
                        <span>•</span>
                        <span>AICTE Approved</span>
                        {/* <span>•</span> */}

                    </div>
                </div>
            </div>


            <div className="bg-white border-b border-gray-200">
                <div className="max-w-8xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-4">
                        <img src={vgec_hd} alt="VGEC Logo" className="w-14 h-14 object-contain" />
                        <div>
                            <h1 className="font-heading font-bold text-lg md:text-xl text-gray-900 uppercase tracking-wide leading-tight">
                                {activeDept ? `VGEC - ${activeDept}` : 'VGEC Department Portal  '}
                            </h1>
                            <p className="text-xs md:text-sm text-gray-500 font-medium tracking-wider uppercase">
                                {activeDept ? 'Building the Future Together' : 'Vishwakarma Government Engineering College'}
                            </p>
                        </div>
                    </Link>
                    {/* LOGIN  */}
                    <div className="hidden lg:flex item-center">
                        <div className="relative">
                            {isAuthenticated ? (
                                <>
                                    <Link to={portalLink} className="bg-primary text-white text-sm font-semibold px-7 py-2 mr-7 rounded-lg hover:bg-blue-900 transition ">Dashboard</Link>
                                    <button onClick={logout} className="bg-primary text-white text-sm font-semibold px-7 py-2 rounded-lg hover:bg-blue-900 transition ">Logout</button>
                                </>
                            ) : (
                                <Link to="/login" className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-900 transition block text-center">Faculty Login</Link>
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

                        {/* People Dropdown */}
                        <div ref={peopleRef} className="relative">
                            <button
                                onClick={() => { setPeopleOpen(!peopleOpen); setAcademicsOpen(false); }}
                                className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition flex items-center space-x-1 ${isActive('/faculty') ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}
                            >
                                <span>People</span>
                                <svg className={`w-3 h-3 transition-transform ${peopleOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {peopleOpen && (
                                <div className="absolute top-full left-0 mt-0 bg-white shadow-xl rounded-b-lg border border-gray-200 min-w-[180px] z-50 animate-slide-down">
                                    <Link to={getDeptLink("/faculty")} onClick={() => setPeopleOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary hover:text-white transition">Faculty</Link>
                                </div>
                            )}
                        </div>

                        {/* Academics Dropdown */}
                        <div ref={academicsRef} className="relative">
                            <button
                                onClick={() => { setAcademicsOpen(!academicsOpen); setPeopleOpen(false); }}
                                className={`px-4 py-2 text-sm font-semibold uppercase tracking-wider transition flex items-center space-x-1 ${(isActive('/timetable') || isActive('/calendar')) ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}
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
                        <Link to="/" onClick={() => setOpen(false)} className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Home</Link>
                        <Link to={getDeptLink("/faculty")} onClick={() => setOpen(false)} className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/faculty') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Faculty</Link>
                        <Link to={getDeptLink("/notices")} onClick={() => setOpen(false)} className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/notices') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Notices</Link>
                        <Link to={getDeptLink("/timetable")} onClick={() => setOpen(false)} className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/timetable') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Timetable</Link>
                        <Link to={getDeptLink("/events")} onClick={() => setOpen(false)} className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/events') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Events</Link>
                        <Link to={getDeptLink("/calendar")} onClick={() => setOpen(false)} className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/calendar') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Calendar</Link>
                        <div className="pt-3 border-t border-gray-200">
                            {isAuthenticated ? (
                                <>
                                    <Link to={portalLink} onClick={() => setOpen(false)} className="block px-3 py-2 text-primary font-medium text-sm">Dashboard</Link>
                                    <button onClick={() => { logout(); setOpen(false); }} className="block px-3 py-2 text-gray-500 text-sm">Logout</button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold text-center">Faculty Login</Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
