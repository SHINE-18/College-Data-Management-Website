import { useState } from 'react';
import toast from 'react-hot-toast';

const initialPubs = [
    { id: 1, title: 'Deep Learning for Natural Language Understanding', journal: 'IEEE Transactions on AI', issn: '2168-2267', year: 2024, type: 'Journal', indexType: 'SCI', doi: '10.1109/TAI.2024.001' },
    { id: 2, title: 'Federated Learning in Healthcare: A Comprehensive Survey', journal: 'ACM Computing Surveys', issn: '0360-0300', year: 2023, type: 'Journal', indexType: 'SCI', doi: '10.1145/ACM.2023.045' },
    { id: 3, title: 'Edge AI for Real-time Object Detection', journal: 'CVPR 2023 Conference', issn: '', year: 2023, type: 'Conference', indexType: 'Scopus', doi: '10.1109/CVPR.2023.078' },
    { id: 4, title: 'AI-Driven Smart Campus: Architecture and Implementation', journal: 'Book Chapter — Springer', issn: '', year: 2022, type: 'Book', indexType: 'Scopus', doi: '' },
    { id: 5, title: 'Method for Automated Code Review Using Transformers', journal: 'Indian Patent Office', issn: '', year: 2024, type: 'Patent', indexType: 'Other', doi: 'IN202411000123' },
];

const typeColors = { Journal: 'bg-blue-100 text-blue-700', Conference: 'bg-purple-100 text-purple-700', Book: 'bg-green-100 text-green-700', Patent: 'bg-orange-100 text-orange-700' };
const indexColors = { SCI: 'bg-green-100 text-green-700', Scopus: 'bg-blue-100 text-blue-700', UGC: 'bg-purple-100 text-purple-700', Other: 'bg-gray-100 text-gray-700' };

const emptyForm = { title: '', journal: '', issn: '', year: '', type: 'Journal', indexType: 'SCI', doi: '' };

const Publications = () => {
    const [pubs, setPubs] = useState(initialPubs);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
    const openEdit = (p) => { setForm({ title: p.title, journal: p.journal, issn: p.issn, year: p.year, type: p.type, indexType: p.indexType, doi: p.doi }); setEditId(p.id); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditId(null); };

    const handleSave = () => {
        if (!form.title || !form.journal || !form.year) { toast.error('Please fill required fields.'); return; }
        if (editId) {
            setPubs(prev => prev.map(p => p.id === editId ? { ...p, ...form } : p));
            toast.success('Publication updated!');
        } else {
            setPubs(prev => [...prev, { ...form, id: Date.now() }]);
            toast.success('Publication added!');
        }
        closeModal();
    };

    const handleDelete = (id) => { setPubs(prev => prev.filter(p => p.id !== id)); toast.success('Publication deleted.'); };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Publications</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your research publications, patents, and book chapters.</p>
                </div>
                <button onClick={openAdd} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span>Add Publication</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Journal/Venue</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Year</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Index</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pubs.map((p, i) => (
                                <tr key={p.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                    <td className="px-6 py-3 text-sm font-medium text-gray-900 max-w-xs">
                                        <div className="truncate">{p.title}</div>
                                        {p.doi && <a href={p.doi.startsWith('10.') ? `https://doi.org/${p.doi}` : '#'} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline">DOI: {p.doi}</a>}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{p.journal}</td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{p.year}</td>
                                    <td className="px-6 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[p.type]}`}>{p.type}</span></td>
                                    <td className="px-6 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${indexColors[p.indexType]}`}>{p.indexType}</span></td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => openEdit(p)} className="text-accent hover:text-accent-600 text-sm font-medium">Edit</button>
                                            <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pubs.length === 0 && <div className="text-center py-12 text-gray-400"><p>No publications yet.</p></div>}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Edit' : 'Add'} Publication</h2>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Journal/Venue *</label><input value={form.journal} onChange={e => setForm({ ...form, journal: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">ISSN</label><input value={form.issn} onChange={e => setForm({ ...form, issn: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Year *</label><input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white">{['Journal', 'Conference', 'Book', 'Patent'].map(t => <option key={t}>{t}</option>)}</select></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Index Type</label><select value={form.indexType} onChange={e => setForm({ ...form, indexType: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white">{['SCI', 'Scopus', 'UGC', 'Other'].map(t => <option key={t}>{t}</option>)}</select></div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">DOI</label><input value={form.doi} onChange={e => setForm({ ...form, doi: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="10.xxxx/xxxxx" /></div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={closeModal} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                            <button onClick={handleSave} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Publications;
