import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const emptyForm = {
    degree: '',
    fieldOfStudy: '',
    institution: '',
    degreeType: 'Bachelor',
    endYear: ''
};

const Qualifications = () => {
    const { user } = useAuth();
    const [facultyId, setFacultyId] = useState(null);
    const [qualifications, setQualifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingQualification, setEditingQualification] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const loadQualifications = async (resolvedFacultyId) => {
        const response = await api.get(`/qualifications/faculty/${resolvedFacultyId}`);
        setQualifications(Array.isArray(response.data) ? response.data : []);
    };

    useEffect(() => {
        const fetchQualifications = async () => {
            if (!user?.email) {
                setLoading(false);
                return;
            }

            try {
                const facultyResponse = await api.get(`/faculty?search=${encodeURIComponent(user.email)}`);
                const facultyList = facultyResponse.data.data || [];
                const myProfile = facultyList.find(faculty => faculty.email === user.email);

                if (myProfile) {
                    setFacultyId(myProfile._id);
                    await loadQualifications(myProfile._id);
                }
            } catch (error) {
                console.error('Failed to fetch qualifications', error);
                toast.error('Failed to load qualifications');
            } finally {
                setLoading(false);
            }
        };

        fetchQualifications();
    }, [user]);

    const closeModal = () => {
        setShowModal(false);
        setEditingQualification(null);
        setForm(emptyForm);
    };

    const openAdd = () => {
        setEditingQualification(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (qualification) => {
        setEditingQualification(qualification);
        setForm({
            degree: qualification.degree || '',
            fieldOfStudy: qualification.fieldOfStudy || '',
            institution: qualification.institution || '',
            degreeType: qualification.degreeType || 'Bachelor',
            endYear: qualification.endYear ? String(qualification.endYear) : ''
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!facultyId) {
            toast.error('Faculty profile not found. Cannot save qualifications.');
            return;
        }

        if (!form.degree || !form.fieldOfStudy || !form.institution || !form.endYear) {
            toast.error('Please fill all required fields.');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                degree: form.degree.trim(),
                fieldOfStudy: form.fieldOfStudy.trim(),
                institution: form.institution.trim(),
                degreeType: form.degreeType,
                endYear: Number(form.endYear)
            };

            if (editingQualification?._id) {
                await api.put(`/qualifications/${editingQualification._id}`, payload);
                toast.success('Qualification updated!');
            } else {
                await api.post('/qualifications', payload);
                toast.success('Qualification added!');
            }

            await loadQualifications(facultyId);
            closeModal();
        } catch (error) {
            console.error('Qualification save failed', error);
            toast.error(error.response?.data?.message || 'Failed to save qualification');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (qualificationId) => {
        if (!window.confirm('Are you sure you want to delete this qualification?')) {
            return;
        }

        try {
            await api.delete(`/qualifications/${qualificationId}`);
            toast.success('Qualification deleted.');
            if (facultyId) {
                await loadQualifications(facultyId);
            }
        } catch (error) {
            console.error('Qualification delete failed', error);
            toast.error(error.response?.data?.message || 'Failed to delete qualification');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Qualifications</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your academic qualifications and degrees.</p>
                </div>
                <button onClick={openAdd} disabled={!facultyId} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md flex items-center space-x-2 disabled:opacity-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span>Add Qualification</span>
                </button>
            </div>

            {!facultyId && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm font-medium">
                    Warning: Your logged-in email does not currently match any faculty records in the public directory. Please ask the HOD to add a faculty profile for you before adding qualifications.
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Degree</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Field</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Institution</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Year</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {qualifications.map((qualification, index) => (
                            <tr key={qualification._id || index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{qualification.degree}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{qualification.fieldOfStudy}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{qualification.institution}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{qualification.degreeType}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{qualification.endYear || '-'}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => openEdit(qualification)} className="text-accent hover:text-accent-600 transition text-sm font-medium">Edit</button>
                                        <button onClick={() => handleDelete(qualification._id)} className="text-red-500 hover:text-red-700 transition text-sm font-medium">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {qualifications.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <p>No qualifications added yet.</p>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editingQualification ? 'Edit' : 'Add'} Qualification</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                                <input value={form.degree} onChange={e => setForm({ ...form, degree: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g., Ph.D." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study *</label>
                                <input value={form.fieldOfStudy} onChange={e => setForm({ ...form, fieldOfStudy: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g., Computer Engineering" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                                <input value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g., GTU" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree Type *</label>
                                    <select value={form.degreeType} onChange={e => setForm({ ...form, degreeType: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white">
                                        {['Bachelor', 'Master', 'Doctorate', 'Diploma', 'Certificate', 'Other'].map(type => <option key={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year of Completion *</label>
                                    <input type="number" value={form.endYear} onChange={e => setForm({ ...form, endYear: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="2024" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={closeModal} disabled={saving} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md flex items-center gap-2 disabled:opacity-70">
                                {saving ? <><span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></span> Saving...</> : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Qualifications;
