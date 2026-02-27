import { useState } from 'react';
import toast from 'react-hot-toast';

const initialQualifications = [
    { id: 1, degree: 'B.Tech', subject: 'Computer Science', university: 'JNTU Hyderabad', year: 2000, percentage: '82%', certificate: true },
    { id: 2, degree: 'M.Tech', subject: 'Computer Science & Engineering', university: 'IIT Delhi', year: 2003, percentage: '88%', certificate: true },
    { id: 3, degree: 'Ph.D.', subject: 'Artificial Intelligence', university: 'IIT Delhi', year: 2008, percentage: 'Awarded', certificate: true },
];

const emptyForm = { degree: '', subject: '', university: '', year: '', percentage: '', certificate: false };

const Qualifications = () => {
    const [qualifications, setQualifications] = useState(initialQualifications);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
    const openEdit = (q) => { setForm({ degree: q.degree, subject: q.subject, university: q.university, year: q.year, percentage: q.percentage, certificate: q.certificate }); setEditId(q.id); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); };

    const handleSave = () => {
        if (!form.degree || !form.subject || !form.university || !form.year) { toast.error('Please fill all required fields.'); return; }
        if (editId) {
            setQualifications(prev => prev.map(q => q.id === editId ? { ...q, ...form } : q));
            toast.success('Qualification updated!');
        } else {
            setQualifications(prev => [...prev, { ...form, id: Date.now() }]);
            toast.success('Qualification added!');
        }
        closeModal();
    };

    const handleDelete = (id) => {
        setQualifications(prev => prev.filter(q => q.id !== id));
        toast.success('Qualification deleted.');
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Qualifications</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your academic qualifications and certificates.</p>
                </div>
                <button onClick={openAdd} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span>Add Qualification</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Degree</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">University</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Year</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">%/Grade</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {qualifications.map((q, i) => (
                            <tr key={q.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900">{q.degree}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{q.subject}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{q.university}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{q.year}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{q.percentage}</td>
                                <td className="px-6 py-3">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => openEdit(q)} className="text-accent hover:text-accent-600 transition text-sm font-medium">Edit</button>
                                        <button onClick={() => handleDelete(q.id)} className="text-red-500 hover:text-red-700 transition text-sm font-medium">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {qualifications.length === 0 && <div className="text-center py-12 text-gray-400"><p>No qualifications added yet.</p></div>}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Edit' : 'Add'} Qualification</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                                <select value={form.degree} onChange={e => setForm({ ...form, degree: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white">
                                    <option value="">Select Degree</option>
                                    {['B.Tech', 'B.E.', 'M.Tech', 'M.E.', 'M.Sc.', 'Ph.D.', 'MBA', 'Other'].map(d => <option key={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g., Computer Science" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
                                <input value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g., IIT Delhi" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                                    <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="2020" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Percentage/Grade</label>
                                    <input value={form.percentage} onChange={e => setForm({ ...form, percentage: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="85%" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Certificate</label>
                                <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent/10 file:text-accent hover:file:bg-accent/20 transition" />
                            </div>
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

export default Qualifications;
