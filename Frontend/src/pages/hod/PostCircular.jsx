import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const PostCircular = () => {
    const { user } = useAuth();
    const [form, setForm] = useState({ title: '', content: '', category: 'General', target: 'All Faculty', expiry: '' });
    const [fileItem, setFileItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Separate state for internal notices and GTU circulars
    const [internalNotices, setInternalNotices] = useState([]);
    const [gtuCirculars, setGtuCirculars] = useState([]);
    const [loadingInternal, setLoadingInternal] = useState(true);
    const [loadingGtu, setLoadingGtu] = useState(true);
    const [activeListTab, setActiveListTab] = useState('internal');

    useEffect(() => {
        fetchInternalNotices();
        fetchGtuCirculars();
    }, []);

    const fetchInternalNotices = async () => {
        try {
            setLoadingInternal(true);
            const params = new URLSearchParams({ limit: '20' });
            if (user?.department) {
                params.set('department', user.department);
            }
            // Only fetch Internal notices (exclude GTU)
            params.set('excludeSource', 'GTU');
            const response = await api.get(`/notices?${params.toString()}`);
            setInternalNotices(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch internal notices', error);
            toast.error('Failed to load college notices');
        } finally {
            setLoadingInternal(false);
        }
    };

    const fetchGtuCirculars = async () => {
        try {
            setLoadingGtu(true);
            const params = new URLSearchParams({ limit: '20' });
            if (user?.department) {
                params.set('department', user.department);
            }
            // Only fetch GTU-sourced notices
            params.set('source', 'GTU');
            const response = await api.get(`/notices?${params.toString()}`);
            setGtuCirculars(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch GTU circulars', error);
            toast.error('Failed to load GTU circulars');
        } finally {
            setLoadingGtu(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.content) { toast.error('Title and content are required.'); return; }

        try {
            setSubmitting(true);

            let payload = {
                title: form.title,
                content: form.content,
                category: form.category,
                department: user?.department || 'Computer Engineering',
            };

            if (fileItem) {
                payload = new FormData();
                payload.append('title', form.title);
                payload.append('content', form.content);
                payload.append('category', form.category);
                payload.append('department', user?.department || 'Computer Engineering');
                payload.append('attachment', fileItem);
            }

            await api.post('/notices', payload, fileItem ? {
                headers: { 'Content-Type': 'multipart/form-data' }
            } : undefined);

            toast.success('Notice posted successfully!');
            setForm({ title: '', content: '', category: 'General', target: 'All Faculty', expiry: '' });
            setFileItem(null);
            // reset file input visually
            const fileInput = document.getElementById('circular-file-upload');
            if (fileInput) fileInput.value = '';

            fetchInternalNotices(); // Refresh internal list
        } catch (error) {
            console.error('Failed to post notice', error);
            toast.error(error.response?.data?.message || 'Failed to post notice');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id, source) => {
        const label = source === 'GTU' ? 'GTU circular' : 'notice';
        if (!window.confirm(`Are you sure you want to delete this ${label}?`)) return;
        try {
            await api.delete(`/notices/${id}`);
            toast.success(`${source === 'GTU' ? 'GTU circular' : 'Notice'} deleted successfully!`);
            if (source === 'GTU') {
                fetchGtuCirculars();
            } else {
                fetchInternalNotices();
            }
        } catch (error) {
            console.error('Failed to delete', error);
            toast.error(error.response?.data?.message || 'Failed to delete');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const renderTable = (data, loading, source) => (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date Posted</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                <div className="flex justify-center items-center">
                                    <span className="animate-spin w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full mr-2"></span>
                                    Loading...
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-8 text-center text-gray-400 text-sm">
                                {source === 'GTU' ? 'No GTU circulars found.' : 'No college notices posted yet.'}
                            </td>
                        </tr>
                    ) : data.map((c, i) => (
                        <tr key={c._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 max-w-[300px]">
                                <p className="line-clamp-2" title={c.title}>{c.title}</p>
                                {source === 'GTU' && c.sourceUrl && (
                                    <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer"
                                        className="text-xs text-blue-500 hover:underline mt-0.5 inline-block">
                                        View original ↗
                                    </a>
                                )}
                            </td>
                            <td className="px-6 py-3">
                                <span className="text-xs font-semibold bg-accent/10 text-accent px-2.5 py-1 rounded-full whitespace-nowrap">{c.category}</span>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-600 whitespace-nowrap">{formatDate(c.publishedAt || c.createdAt || c.date)}</td>
                            <td className="px-6 py-3">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {c.isActive ? 'Active' : 'Archived'}
                                </span>
                            </td>
                            <td className="px-6 py-3">
                                <button
                                    onClick={() => handleDelete(c._id, source)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition"
                                    title={`Delete ${source === 'GTU' ? 'circular' : 'notice'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Post Circular / Notice</h1>
                <p className="text-gray-500 text-sm mt-1">Create and distribute circulars to faculty and students.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">New Notice</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="Notice title..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                        <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={5} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none resize-none" placeholder="Write notice content..." />
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
                        <input id="circular-file-upload" type="file" onChange={e => setFileItem(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent/10 file:text-accent hover:file:bg-accent/20" />
                    </div>
                    <button type="submit" disabled={submitting} className="bg-primary text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary/25 disabled:opacity-70 flex items-center gap-2">
                        {submitting ? (
                            <><span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></span> Posting...</>
                        ) : 'Post Notice'}
                    </button>
                </form>
            </div>

            {/* ═══ Tabbed Notice / Circular List ═══ */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tab Header */}
                <div className="border-b border-gray-100">
                    <div className="flex">
                        <button
                            onClick={() => setActiveListTab('internal')}
                            className={`flex-1 sm:flex-none px-6 py-4 text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center justify-center gap-2 ${
                                activeListTab === 'internal'
                                    ? 'border-primary text-primary bg-primary/[0.03]'
                                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                            College Notices
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                activeListTab === 'internal'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-gray-100 text-gray-500'
                            }`}>
                                {loadingInternal ? '...' : internalNotices.length}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveListTab('gtu')}
                            className={`flex-1 sm:flex-none px-6 py-4 text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center justify-center gap-2 ${
                                activeListTab === 'gtu'
                                    ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            GTU Circulars
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                activeListTab === 'gtu'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-500'
                            }`}>
                                {loadingGtu ? '...' : gtuCirculars.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeListTab === 'internal' && renderTable(internalNotices, loadingInternal, 'Internal')}
                {activeListTab === 'gtu' && renderTable(gtuCirculars, loadingGtu, 'GTU')}
            </div>
        </div>
    );
};

export default PostCircular;
