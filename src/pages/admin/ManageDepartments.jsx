import { useState } from 'react';
import toast from 'react-hot-toast';

const initialDepts = [
    { id: 1, name: 'Computer Science & Engineering', code: 'CSE', established: 1998, hod: 'Dr. Rajesh Kumar' },
    { id: 2, name: 'Electronics & Communication Engineering', code: 'ECE', established: 1985, hod: 'Dr. Priya Sharma' },
    { id: 3, name: 'Mechanical Engineering', code: 'ME', established: 1980, hod: 'Dr. Suresh Patel' },
    { id: 4, name: 'Civil Engineering', code: 'CE', established: 1975, hod: 'Dr. Anita Singh' },
    { id: 5, name: 'Electrical Engineering', code: 'EE', established: 1978, hod: 'Dr. Vikram Reddy' },
    { id: 6, name: 'Information Technology', code: 'IT', established: 2002, hod: 'Dr. Meena Gupta' },
];

const hodOptions = ['Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Suresh Patel', 'Dr. Anita Singh', 'Dr. Vikram Reddy', 'Dr. Meena Gupta', 'Dr. Sneha Verma', 'Dr. Pooja Mehta'];
const emptyForm = { name: '', code: '', established: '' };

const ManageDepartments = () => {
    const [depts, setDepts] = useState(initialDepts);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const handleSave = () => {
        if (!form.name || !form.code || !form.established) { toast.error('Fill all required fields.'); return; }
        setDepts(prev => [...prev, { ...form, id: Date.now(), hod: 'Unassigned' }]);
        toast.success('Department added!');
        setShowModal(false); setForm(emptyForm);
    };

    const assignHod = (id, hod) => {
        setDepts(prev => prev.map(d => d.id === id ? { ...d, hod } : d));
        toast.success('HOD assigned!');
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
                        </tr>
                    </thead>
                    <tbody>
                        {depts.map((d, i) => (
                            <tr key={d.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900">{d.name}</td>
                                <td className="px-6 py-3"><span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{d.code}</span></td>
                                <td className="px-6 py-3 text-sm text-gray-600">{d.established}</td>
                                <td className="px-6 py-3">
                                    <select value={d.hod} onChange={e => assignHod(d.id, e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-accent outline-none">
                                        <option value="Unassigned">— Assign HOD —</option>
                                        {hodOptions.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
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
