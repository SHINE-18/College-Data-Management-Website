import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const departmentOptions = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT'];
const designationOptions = ['Professor', 'Associate Professor', 'Assistant Professor', 'HOD', 'Lecturer'];

const ManageFaculty = () => {
    const { user } = useAuth();
    const defaultDepartment = user?.department || 'CE';
    const emptyForm = { name: '', email: '', designation: 'Assistant Professor', department: defaultDepartment, joiningDate: '' };

    const [faculty, setFaculty] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setForm((prev) => ({ ...prev, department: defaultDepartment }));
    }, [defaultDepartment]);

    useEffect(() => {
        fetchFaculty();
    }, [user?.department, user?.role]);

    const fetchFaculty = async () => {
        try {
            setLoading(true);
            const response = await api.get('/faculty/admin/all');
            setFaculty(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch faculty');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setForm(emptyForm);
        setEditId(null);
        setShowModal(true);
    };

    const openEdit = (facultyMember) => {
        setForm({
            name: facultyMember.name,
            email: facultyMember.email,
            designation: facultyMember.designation,
            department: facultyMember.department || defaultDepartment,
            joiningDate: facultyMember.joiningDate ? new Date(facultyMember.joiningDate).toISOString().split('T')[0] : ''
        });
        setEditId(facultyMember._id);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditId(null);
    };

    const handleSave = async () => {
        if (!form.name || !form.email) {
            toast.error('Fill all required fields.');
            return;
        }
        if (!/\S+@\S+\.\S+/.test(form.email)) {
            toast.error('Invalid email format.');
            return;
        }

        try {
            if (editId) {
                await api.put(`/faculty/${editId}`, form);
                toast.success('Faculty updated!');
            } else {
                await api.post('/faculty', form);
                toast.success('Faculty added!');
            }
            fetchFaculty();
            closeModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save faculty');
            console.error(error);
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await api.put(`/faculty/${id}`, { isActive: !currentStatus });
            toast.success('Faculty status updated.');
            fetchFaculty();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
            console.error(error);
        }
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
                <table className="w-full min-w-[760px]">
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
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">Loading faculty...</td></tr>
                        ) : faculty.length > 0 ? (
                            faculty.map((facultyMember, index) => (
                                <tr key={facultyMember._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white text-xs font-bold">{facultyMember.name[0]}</span>
                                            </div>
                                            <span>{facultyMember.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{facultyMember.email}</td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{facultyMember.designation}</td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{facultyMember.joiningDate ? new Date(facultyMember.joiningDate).toLocaleDateString() : '—'}</td>
                                    <td className="px-6 py-3">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${facultyMember.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {facultyMember.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => openEdit(facultyMember)} className="text-accent hover:text-accent-600 text-sm font-medium">Edit</button>
                                            <button onClick={() => toggleStatus(facultyMember._id, facultyMember.isActive)} className={`text-sm font-medium ${facultyMember.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}>
                                                {facultyMember.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-400">No faculty members found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editId ? 'Edit' : 'Add'} Faculty</h2>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Designation</label><select value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">{designationOptions.map((designation) => <option key={designation} value={designation}>{designation}</option>)}</select></div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                {user?.role === 'super_admin' ? (
                                    <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
                                        {departmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}
                                    </select>
                                ) : (
                                    <input value={form.department} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
                                )}
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label><input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" /></div>

                            {!editId && (
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                        <strong>Note:</strong> Creating a faculty profile will automatically generate a login account with the default password: <code className="bg-blue-100 px-1 rounded">Faculty@VGEC123</code>
                                    </p>
                                </div>
                            )}
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
