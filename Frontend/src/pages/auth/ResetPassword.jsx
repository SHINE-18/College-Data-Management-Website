import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../../utils/axios';
import vgec_logo from '../../assets/vgec_hd.png';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
        if (password !== confirm) { toast.error('Passwords do not match.'); return; }

        setLoading(true);
        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setDone(true);
            toast.success('Password reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset link is invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-primary-800 to-black flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

            <div className="w-full max-w-md relative">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex flex-col items-center space-y-3">
                        <img src={vgec_logo} alt="VGEC Logo" className="w-20 h-20 object-contain drop-shadow-lg" />
                        <div>
                            <h1 className="text-white font-bold text-xl">Vishwakarma Government Engineering College</h1>
                            <p className="text-blue-200 text-sm mt-1">Department of Computer Engineering</p>
                        </div>
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {done ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaLock className="text-green-500 text-2xl" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Password Updated!</h2>
                            <p className="text-gray-500 text-sm">Redirecting you to login...</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <FaLock className="text-primary text-xl" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
                                <p className="text-gray-500 text-sm mt-1">Your new password must be at least 6 characters.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="relative">
                                    <label htmlFor="rp-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                    <input
                                        id="rp-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="At least 6 characters"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition pr-12"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[30px] p-2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                                    </button>
                                </div>
                                <div>
                                    <label htmlFor="rp-confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                    <input
                                        id="rp-confirm"
                                        type="password"
                                        value={confirm}
                                        onChange={e => setConfirm(e.target.value)}
                                        placeholder="Re-enter new password"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
                                    />
                                </div>
                                <button
                                    id="rp-submit-btn"
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
