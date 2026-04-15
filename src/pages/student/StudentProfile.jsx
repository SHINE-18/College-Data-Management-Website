// ============================================
// pages/student/StudentProfile.jsx — Student Profile Editor
// ============================================

import { useState, useEffect } from 'react';
import api from '../../utils/axios';

const StudentProfile = () => {
    const [student, setStudent] = useState(() => {
        try { return JSON.parse(localStorage.getItem('student') || 'null'); } catch { return null; }
    });
    const [form, setForm] = useState({ phone: '', address: '', guardianName: '', guardianContact: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (student) {
            setForm({
                phone: student.phone || '',
                address: student.address || '',
                guardianName: student.guardianName || '',
                guardianContact: student.guardianContact || '',
            });
        }
    }, [student]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });
        try {
            const { data } = await api.patch('/student/profile', form);
            setStudent(data.student);
            localStorage.setItem('student', JSON.stringify(data.student));
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
        } catch (err) {
            setMessage({ text: err?.response?.data?.message || 'Update failed.', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const fields = [
        { name: 'phone', label: 'Phone', type: 'tel', placeholder: '9876543210' },
        { name: 'address', label: 'Address', type: 'text', placeholder: '123 Main St, Ahmedabad' },
        { name: 'guardianName', label: 'Guardian Name', type: 'text', placeholder: "Guardian's full name" },
        { name: 'guardianContact', label: 'Guardian Contact', type: 'tel', placeholder: '9876543210' },
    ];

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-8 text-white text-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                        {student?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <h1 className="text-xl font-bold">{student?.name}</h1>
                    <p className="text-primary-200 text-sm mt-0.5">{student?.enrollmentNo} · {student?.department}</p>
                    <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                        <span className="bg-white/10 px-3 py-1 rounded-full">Sem {student?.semester}</span>
                        <span className="bg-white/10 px-3 py-1 rounded-full">{student?.division && `Div ${student.division}`}</span>
                    </div>
                </div>

                {/* Read-only info */}
                <div className="grid grid-cols-2 gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{student?.email}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Enrollment No</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{student?.enrollmentNo}</p>
                    </div>
                </div>

                {/* Editable form */}
                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4" id="student-profile-form">
                    <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Edit Profile</h2>

                    {fields.map(f => (
                        <div key={f.name}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
                            <input
                                type={f.type}
                                name={f.name}
                                value={form[f.name]}
                                onChange={handleChange}
                                placeholder={f.placeholder}
                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                                id={`profile-${f.name}`}
                            />
                        </div>
                    ))}

                    {message.text && (
                        <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                            {message.text}
                        </p>
                    )}

                    <button type="submit" disabled={saving}
                        className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-60"
                        id="profile-save-btn">
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StudentProfile;
