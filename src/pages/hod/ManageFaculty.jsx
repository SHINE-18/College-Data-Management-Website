import { useState } from 'react';
import toast from 'react-hot-toast';

const initialFaculty = [
    { id: 1, name: 'Dr. Sneha Verma', email: 'sneha.v@college.edu', designation: 'Associate Professor', joiningDate: '2012-06-15', status: 'Active' },
    { id: 2, name: 'Prof. Amit Joshi', email: 'amit.j@college.edu', designation: 'Assistant Professor', joiningDate: '2018-07-01', status: 'Active' },
    { id: 3, name: 'Dr. Kavita Nair', email: 'kavita.n@college.edu', designation: 'Associate Professor', joiningDate: '2015-08-10', status: 'Active' },
    { id: 4, name: 'Prof. Deepak Rao', email: 'deepak.r@college.edu', designation: 'Assistant Professor', joiningDate: '2020-01-15', status: 'Active' },
    { id: 5, name: 'Dr. Pooja Mehta', email: 'pooja.m@college.edu', designation: 'Professor', joiningDate: '2010-03-20', status: 'Active' },
    { id: 6, name: 'Prof. Rahul Shah', email: 'rahul.s@college.edu', designation: 'Assistant Professor', joiningDate: '2019-11-05', status: 'Inactive' },
];

const emptyForm = { name: '', email: '', designation: 'Assistant Professor', joiningDate: '' };

const ManageFaculty = () => {
    const [faculty, setFaculty] = useState(initialFaculty);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const openAdd = () => { setForm(emptyForm); setEditId(null); setShowModal(true); };
    const openEdit = (f) => { setForm({ name: f.name, email: f.email, designation: f.designation, joiningDate: f.joiningDate }); setEditId(f.id); setShowModal(true); };
    const closeModal = () => { setShowModal(false); setEditId(null); };

    const handleSave = () => {
        if (!form.name || !form.email || !form.joiningDate) { toast.error('Fill all required fields.'); return; }
        if (!/\S+@\S+\.\S+/.test(form.email)) { toast.error('Invalid email format.'); return; }
        if (editId) {
            setFaculty(prev => prev.map(f => f.id === editId ? { ...f, ...form } : f));
            toast.success('Faculty updated!');
        } else {
            setFaculty(prev => [...prev, { ...form, id: Date.now(), status: 'Active' }]);
            toast.success('Faculty added!');
        }
        closeModal();
    };

    const toggleStatus = (id) => {
        setFaculty(prev => prev.map(f => f.id === id ? { ...f, status: f.status === 'Active' ? 'Inactive' : 'Active' } : f));
        toast.success('Faculty status updated.');
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Faculty</h1>
                    <p className="text-gray-500 text-sm mt-1">Add, edit, or deactivate faculty members in your department.</p>
                </div>
                <button onClick={openAdd} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span>Add Faculty</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Designation</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joining Date</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faculty.map((f, i) => (
                            <tr key={f.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900 flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xs font-bold">{f.name[0]}</span>
                                    </div>
                                    <span>{f.name}</span>
                                </td>
                                <td className="px-6 py-3 text-sm text-gray-600">{f.email}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{f.designation}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{f.joiningDate}</td>
                                <td className="px-6 py-3">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${f.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{f.status}</span>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => openEdit(f)} className="text-accent hover:text-accent-600 text-sm font-medium">Edit</button>
                                        <button onClick={() => toggleStatus(f.id)} className={`text-sm font-medium ${f.status === 'Active' ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}>
                                            {f.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Edit' : 'Add'} Faculty</h2>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Designation</label><select value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">{['Professor', 'Associate Professor', 'Assistant Professor'].map(d => <option key={d}>{d}</option>)}</select></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Joining Date *</label><input type="date" value={form.joiningDate} onChange={e => setForm({ ...form, joiningDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" /></div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={closeModal} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageFaculty;
