import { useState } from 'react';
import toast from 'react-hot-toast';

const pastCirculars = [
    { id: 1, title: 'Mid-Semester Exam Schedule', category: 'Exam', date: 'Feb 20, 2026', readCount: 18, target: 'All Faculty' },
    { id: 2, title: 'FDP Registration Reminder', category: 'Training', date: 'Feb 10, 2026', readCount: 12, target: 'All Faculty' },
    { id: 3, title: 'Research Paper Submission Deadline', category: 'Research', date: 'Jan 25, 2026', readCount: 22, target: 'All Faculty' },
];

const PostCircular = () => {
    const [form, setForm] = useState({ title: '', content: '', category: 'General', target: 'All Faculty', expiry: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title || !form.content) { toast.error('Title and content are required.'); return; }
        toast.success('Circular posted successfully!');
        setForm({ title: '', content: '', category: 'General', target: 'All Faculty', expiry: '' });
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Post Circular</h1>
                <p className="text-gray-500 text-sm mt-1">Create and distribute circulars to faculty members.</p>
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
                                {['General', 'Exam', 'Training', 'Research', 'Administrative', 'Events'].map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                            <select value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                                <option>All Faculty</option>
                                <option>Specific Faculty</option>
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
                    <button type="submit" className="bg-primary text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary/25">Post Circular</button>
                </form>
            </div>

            {/* Past Circulars */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">Past Circulars</h2></div>
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Target</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Read Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pastCirculars.map((c, i) => (
                            <tr key={c.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900">{c.title}</td>
                                <td className="px-6 py-3"><span className="text-xs font-semibold bg-accent/10 text-accent px-2.5 py-1 rounded-full">{c.category}</span></td>
                                <td className="px-6 py-3 text-sm text-gray-600">{c.date}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{c.target}</td>
                                <td className="px-6 py-3 text-sm font-medium text-primary">{c.readCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PostCircular;
