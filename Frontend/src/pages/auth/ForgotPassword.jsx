import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEnvelope } from 'react-icons/fa';
import api from '../../utils/axios';
import vgec_logo from '../../assets/vgec_hd.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) { toast.error('Please enter your email.'); return; }
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong. Try again.');
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
                    {sent ? (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaEnvelope className="text-green-500 text-2xl" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                            <p className="text-gray-500 text-sm mb-6">
                                If <strong>{email}</strong> is registered, you'll receive a password reset link within a few minutes.
                            </p>
                            <Link to="/login" className="text-sm text-primary hover:underline font-medium">← Back to Login</Link>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <FaEnvelope className="text-primary text-xl" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                                <p className="text-gray-500 text-sm mt-1">Enter your staff email to receive a reset link.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="fp-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        id="fp-email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="you@college.edu"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition"
                                    />
                                </div>
                                <button
                                    id="fp-submit-btn"
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Reset Link'}
                                </button>
                            </form>

                            <p className="text-center text-gray-400 text-sm mt-6">
                                <Link to="/login" className="text-primary hover:underline font-medium">← Back to Login</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
