import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';

const hodOptions = ['Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Suresh Patel', 'Dr. Anita Singh', 'Dr. Vikram Reddy', 'Dr. Meena Gupta', 'Dr. Sneha Verma', 'Dr. Pooja Mehta', 'Dr. A. K. Shah', 'Prof. Kajal S. Patel', 'Dr. V. P. Patel'];
const emptyForm = { name: '', code: '', established: '' };

const ManageDepartments = () => {
    const [depts, setDepts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/departments');
            setDepts(response.data.data);
        } catch (error) {
            toast.error('Failed to load departments');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    const handleSave = async () => {
        if (!form.name || !form.code || !form.established) { toast.error('Fill all required fields.'); return; }
        try {
            await api.post('/departments', form);
            toast.success('Department added!');
            setShowModal(false); setForm(emptyForm);
            fetchDepartments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add department');
        }
    };

    const assignHod = async (id, hodName) => {
        try {
            await api.put(`/departments/${id}`, { hod: { name: hodName, message: '' } });
            toast.success('HOD assigned!');
            fetchDepartments();
        } catch (error) {
            toast.error('Failed to assign HOD');
        }
    };

    const removeDept = async (id) => {
        if (confirm('Are you sure you want to remove this department?')) {
            try {
                await api.delete(`/departments/${id}`);
                toast.success('Department removed!');
                fetchDepartments();
            } catch (error) {
                toast.error('Failed to remove department');
            }
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Departments</h1>
                    <p className="text-gray-500 text-sm mt-1">Add departments and assign Heads of Department.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span>Add Department</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Established</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">HOD</th>
                            <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Loading departments...</td></tr>
                        ) : depts.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No departments found.</td></tr>
                        ) : depts.map((d, i) => (
                            <tr key={d._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900">{d.name}</td>
                                <td className="px-6 py-3"><span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{d.code}</span></td>
                                <td className="px-6 py-3 text-sm text-gray-600">{d.established}</td>
                                <td className="px-6 py-3">
                                    <select value={d.hod?.name || 'Unassigned'} onChange={e => assignHod(d._id, e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-accent outline-none">
                                        <option value="Unassigned">— Assign HOD —</option>
                                        {hodOptions.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-3 text-right">
                                    <button
                                        onClick={() => removeDept(d._id)}
                                        className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                                        title="Remove Department"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Add Department</h2>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g., Biomedical Engineering" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Code *</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g., BME" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Established Year *</label><input type="number" value={form.established} onChange={e => setForm({ ...form, established: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g., 2020" /></div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageDepartments;
