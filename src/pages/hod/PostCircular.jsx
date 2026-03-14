import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const PostCircular = () => {
    const { user } = useAuth();
    const [form, setForm] = useState({ title: '', content: '', category: 'General', target: 'All Faculty', expiry: '' });
    const [pastCirculars, setPastCirculars] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCirculars();
    }, []);

    const fetchCirculars = async () => {
        try {
            setLoading(true);
            // Fetch notices, optionally filter by department if needed
            const response = await api.get('/notices?limit=10');
            setPastCirculars(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch circulars', error);
            toast.error('Failed to load past circulars');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.content) { toast.error('Title and content are required.'); return; }

        try {
            setSubmitting(true);
            await api.post('/notices', {
                title: form.title,
                content: form.content,
                category: form.category,
                department: user?.department || 'CE',
                // Expiry and target audience can be added to the Model later if needed
            });
            toast.success('Circular posted successfully!');
            setForm({ title: '', content: '', category: 'General', target: 'All Faculty', expiry: '' });
            fetchCirculars(); // Refresh the list
        } catch (error) {
            console.error('Failed to post circular', error);
            toast.error(error.response?.data?.message || 'Failed to post circular');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Post Circular / Notice</h1>
                <p className="text-gray-500 text-sm mt-1">Create and distribute circulars to faculty and students.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">New Circular</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="Circular title..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                        <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={5} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none resize-none" placeholder="Write circular content..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                                {['General', 'Exam', 'Admission', 'Events', 'Placement', 'Other'].map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                            <select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                                <option>All Faculty</option>
                                <option>Students</option>
                                <option>Everyone</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input type="date" value={form.expiry} onChange={e => setForm({ ...form, expiry: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attach File</label>
                        <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent/10 file:text-accent hover:file:bg-accent/20" />
                    </div>
                    <button type="submit" disabled={submitting} className="bg-primary text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary/25 disabled:opacity-70 flex items-center gap-2">
                        {submitting ? (
                            <><span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></span> Posting...</>
                        ) : 'Post Circular'}
                    </button>
                </form>
            </div>

            {/* Past Circulars */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Past Circulars</h2>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{pastCirculars.length} total</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date Posted</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
                                        <div className="flex justify-center items-center">
                                            <span className="animate-spin w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full mr-2"></span>
                                            Loading circulars...
                                        </div>
                                    </td>
                                </tr>
                            ) : pastCirculars.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400 text-sm">
                                        No circulars posted yet.
                                    </td>
                                </tr>
                            ) : pastCirculars.map((c, i) => (
                                <tr key={c._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                    <td className="px-6 py-3 text-sm font-medium text-gray-900 line-clamp-2 max-w-[300px]" title={c.title}>{c.title}</td>
                                    <td className="px-6 py-3"><span className="text-xs font-semibold bg-accent/10 text-accent px-2.5 py-1 rounded-full whitespace-nowrap">{c.category}</span></td>
                                    <td className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(c.createdAt || c.date)}</td>
                                    <td className="px-6 py-3">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {c.isActive ? 'Active' : 'Archived'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PostCircular;
