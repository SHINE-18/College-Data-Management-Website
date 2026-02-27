import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/departments', label: 'Departments' },
    { path: '/faculty', label: 'Faculty' },
    { path: '/notices', label: 'Notices' },
    { path: '/timetable', label: 'Timetable' },
    { path: '/events', label: 'Events' },
    { path: '/calendar', label: 'Calendar' },
];

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const { isAuthenticated, role, logout, user } = useAuth();
    const location = useLocation();

    const portalLink = role === 'super_admin' ? '/admin/dashboard' : role === 'hod' ? '/hod/dashboard' : '/faculty-portal/dashboard';

    return (
        <nav className="sticky top-0 z-50 bg-primary shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">CP</span>
                        </div>
                        <span className="text-white font-bold text-xl hidden sm:block">College Portal</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === link.path
                                        ? 'bg-accent text-white'
                                        : 'text-gray-200 hover:bg-primary-700 hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Auth buttons */}
                    <div className="hidden md:flex items-center space-x-3">
                        {isAuthenticated ? (
                            <>
                                <Link to={portalLink} className="bg-accent/20 text-accent-100 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent/30 transition">
                                    Dashboard
                                </Link>
                                <button onClick={logout} className="text-gray-300 hover:text-white text-sm font-medium transition">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="bg-accent text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-accent-500 transition shadow-lg shadow-accent/25">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button onClick={() => setOpen(!open)} className="md:hidden text-white p-2 rounded-lg hover:bg-primary-700 transition" id="mobile-menu-btn">
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

            {/* Mobile menu */}
            {open && (
                <div className="md:hidden bg-primary-900 border-t border-primary-700 animate-slide-down">
                    <div className="px-4 py-3 space-y-1">
                        {navLinks.map(link => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setOpen(false)}
                                className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${location.pathname === link.path
                                        ? 'bg-accent text-white'
                                        : 'text-gray-300 hover:bg-primary-700 hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="pt-3 border-t border-primary-700">
                            {isAuthenticated ? (
                                <>
                                    <Link to={portalLink} onClick={() => setOpen(false)} className="block px-3 py-2 text-accent-200 hover:text-white text-sm font-medium">Dashboard</Link>
                                    <button onClick={() => { logout(); setOpen(false); }} className="block px-3 py-2 text-gray-400 hover:text-white text-sm font-medium">Logout</button>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2 bg-accent text-white rounded-lg text-sm font-semibold text-center">Login</Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
