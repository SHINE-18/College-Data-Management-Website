import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import vgec_logo from '../../assets/vgec_hd.png';

const mockUsers = {

};
import api from '../../utils/axios';

const Login = () => {
    const [isStudentLogin, setIsStudentLogin] = useState(true);
    const [identifier, setIdentifier] = useState(''); // Stores email OR enrollment number
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!identifier || !password) { setError('Please fill in all fields.'); return; }

        if (!isStudentLogin && !/\S+@\S+\.\S+/.test(identifier)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const endpoint = isStudentLogin ? '/student-auth/login' : '/auth/login';
            const payload = isStudentLogin
                ? { enrollmentNumber: identifier, password }
                : { email: identifier, password };

            const response = await api.post(endpoint, payload);
            const userData = response.data;

            // Extract token and user info
            const token = userData.token;
            delete userData.token; // Remove token from user object before storing

            // Save to AuthContext/localStorage
            login(token, userData);

            toast.success(`Welcome, ${userData.name}!`);

            // Redirect based on role
            const redirectMap = {
                student: '/student-portal/dashboard',
                faculty: '/faculty-portal/dashboard',
                hod: '/hod/dashboard',
                super_admin: '/admin/dashboard'
            };
            navigate(redirectMap[userData.role] || '/');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Invalid email or password.');
            toast.error('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-primary-800 to-accent flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

            <div className="w-full max-w-md relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex flex-col items-center space-y-3">
                        <img src={vgec_logo} alt="VGEC Logo" className="w-20 h-20 object-contain drop-shadow-lg" />
                        <div>
                            <h1 className="text-white font-bold text-xl">Vishwakarma Government Engineering College</h1>
                            <p className="text-blue-200 text-sm mt-1">Department of Computer Engineering</p>
                        </div>
                    </Link>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                        <p className="text-gray-500 text-sm mt-1">Sign in to access your portal</p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                        <button
                            onClick={() => { setIsStudentLogin(true); setIdentifier(''); setError(''); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${isStudentLogin ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Student
                        </button>
                        <button
                            onClick={() => { setIsStudentLogin(false); setIdentifier(''); setError(''); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${!isStudentLogin ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Staff
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4 flex items-center space-x-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                                {isStudentLogin ? 'Enrollment Number' : 'Email Address'}
                            </label>
                            <input
                                id="identifier"
                                type={isStudentLogin ? "text" : "email"}
                                value={identifier}
                                onChange={e => setIdentifier(e.target.value)}
                                placeholder={isStudentLogin ? "e.g. 210170107000" : "you@college.edu"}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition pr-12" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[30px] p-2 text-gray-400 hover:text-gray-600 transition"
                                aria-label={showPassword ? "show password" : "hide password"}
                            >
                                {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                            </button>
                        </div>
                        <button id="login-btn" type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center space-x-2">
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>Sign In</span>}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    {/* <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-400 text-center mb-3">Demo Credentials</p>
                        <div className="space-y-2">
                            {[
                                { label: 'Faculty', email: 'faculty@college.edu', pass: 'faculty123' },
                                { label: 'HOD', email: 'hod@college.edu', pass: 'hod123' },
                                { label: 'Admin', email: 'admin@college.edu', pass: 'admin123' },
                            ].map(cred => (
                                <button key={cred.label} onClick={() => { setEmail(cred.email); setPassword(cred.pass); setError(''); }}
                                    className="w-full text-left text-xs bg-gray-50 hover:bg-gray-100 rounded-lg p-2.5 transition flex items-center justify-between group">
                                    <span className="font-medium text-gray-600">{cred.label}: <span className="text-gray-400">{cred.email}</span></span>
                                    <span className="text-accent opacity-0 group-hover:opacity-100 transition text-[10px]">Click to fill</span>
                                </button>
                            ))}
                        </div>
                    </div> */}
                </div>

                <p className="text-center text-blue-200 text-sm mt-6">
                    <Link to="/" className="hover:text-white transition">← Back to Homepage</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
