import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { FaTrash, FaUserShield, FaChalkboardTeacher, FaUserTie, FaCheckCircle, FaTimesCircle, FaPlus, FaEdit } from 'react-icons/fa';
import { ALL_DEPARTMENTS } from '../../constants/departments';

const roleIcons = {
    super_admin: <FaUserShield className="text-purple-500" title="Super Admin" />,
    hod: <FaUserTie className="text-blue-500" title="HOD" />,
    faculty: <FaChalkboardTeacher className="text-emerald-500" title="Faculty" />
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'hod', department: 'Computer Engineering', designation: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/auth/users');
            setUsers(data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            toast.success('User registered successfully');
            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'faculty', department: 'Computer Engineering', designation: '' });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register user');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/auth/users/${editingUserId}`, {
                name: formData.name,
                role: formData.role,
                department: formData.department,
                designation: formData.designation
            });
            toast.success('User updated successfully');
            setIsEditModalOpen(false);
            setEditingUserId(null);
            setFormData({ name: '', email: '', password: '', role: 'faculty', department: 'Computer Engineering', designation: '' });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    };

    const openEditModal = (user) => {
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Password editing not supported here
            role: user.role,
            department: user.department,
            designation: user.designation || ''
        });
        setEditingUserId(user._id);
        setIsEditModalOpen(true);
    };

    const handleToggleActive = async (id) => {
        try {
            const { data } = await api.put(`/auth/users/${id}/toggle`);
            toast.success(data.message);
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
        try {
            await api.delete(`/auth/users/${id}`);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage system access for faculty and HODs.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-primary hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition text-sm shadow-sm">
                    <FaPlus /> <span>Add User</span>
                </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Role / Dept</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading users...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
                            ) : (
                                Object.entries(
                                    users.reduce((acc, user) => {
                                        const dept = user.department || 'Others';
                                        if (!acc[dept]) acc[dept] = [];
                                        acc[dept].push(user);
                                        return acc;
                                    }, {})
                                ).sort(([a], [b]) => a.localeCompare(b)).map(([dept, deptUsers]) => (
                                    <React.Fragment key={dept}>
                                        <tr className="bg-gray-100/50">
                                            <td colSpan="4" className="px-6 py-3 font-semibold text-gray-700 text-sm">{dept}</td>
                                        </tr>
                                        {deptUsers.map(user => (
                                            <tr key={user._id} className="hover:bg-gray-50/50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        {roleIcons[user.role]}
                                                        <span className="capitalize">{user.role.replace('_', ' ')}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">{user.department} • {user.designation || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-3 text-lg">
                                                    {user.role !== 'super_admin' && (
                                                        <button onClick={() => openEditModal(user)} title="Edit User" className="text-blue-400 hover:text-blue-600 transition">
                                                            <FaEdit size={16} />
                                                        </button>
                                                    )}
                                                    {user.role !== 'super_admin' && (
                                                        <button onClick={() => handleToggleActive(user._id)} title={user.isActive ? 'Deactivate User' : 'Activate User'}
                                                            className={`transition ${user.isActive ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'}`}>
                                                            {user.isActive ? <FaTimesCircle /> : <FaCheckCircle />}
                                                        </button>
                                                    )}
                                                    {user.role !== 'super_admin' && (
                                                        <button onClick={() => handleDelete(user._id)} title="Delete User" className="text-gray-400 hover:text-red-600 transition">
                                                            <FaTrash size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-900">Add New User</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition p-1">✕</button>
                        </div>
                        <form onSubmit={handleRegister} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Temporary Password</label>
                                <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} minLength="6"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Min 6 characters" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                                        <option value="hod">HOD</option>
                                        <option value="faculty">Faculty</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                                    <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                                        {ALL_DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Designation (Optional)</label>
                                <input type="text" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} placeholder="e.g. Assistant Professor"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex space-x-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm font-medium">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-gray-900">Edit User</h3>
                            <button onClick={() => { setIsEditModalOpen(false); setEditingUserId(null); }} className="text-gray-400 hover:text-gray-600 transition p-1">✕</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(Cannot edit)</span></label>
                                <input type="email" disabled value={formData.email}
                                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg text-sm" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                                    <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                                        <option value="hod">HOD</option>
                                        <option value="faculty">Faculty</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                                    <select value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none">
                                        {ALL_DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Designation</label>
                                <input type="text" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} placeholder="e.g. Assistant Professor"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex space-x-3">
                                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingUserId(null); }} className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition text-sm font-medium">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
