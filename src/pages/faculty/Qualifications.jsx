import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const emptyForm = { degree: '', institution: '', year: '' };

const Qualifications = () => {
    const { user } = useAuth();
    const [facultyId, setFacultyId] = useState(null);
    const [qualifications, setQualifications] = useState([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        const fetchQualifications = async () => {
            if (!user?.email) return;
            try {
                const response = await api.get(`/faculty?search=${encodeURIComponent(user.email)}`);
                const facultyList = response.data.data;

                if (facultyList && facultyList.length > 0) {
                    const myProfile = facultyList.find(f => f.email === user.email);
                    if (myProfile) {
                        setFacultyId(myProfile._id);
                        setQualifications(myProfile.qualifications || []);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch qualifications", error);
                toast.error("Failed to load qualifications");
            } finally {
                setLoading(false);
            }
        };
        fetchQualifications();
    }, [user]);

    const openAdd = () => { setForm(emptyForm); setEditIndex(null); setShowModal(true); };

    const openEdit = (qualification, index) => {
        setForm({
            degree: qualification.degree,
            institution: qualification.institution,
            year: qualification.year
        });
        setEditIndex(index);
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditIndex(null); setForm(emptyForm); };

    const updateBackend = async (newQualificationsArray, successMessage) => {
        if (!facultyId) {
            toast.error("Faculty profile not found. Cannot save changes.");
            return;
        }

        try {
            setSaving(true);
            await api.put(`/faculty/${facultyId}`, { qualifications: newQualificationsArray });
            setQualifications(newQualificationsArray);
            toast.success(successMessage);
            closeModal();
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const handleSave = () => {
        if (!form.degree || !form.institution || !form.year) {
            toast.error('Please fill all required fields (Degree, Institution, Year).');
            return;
        }

        let updatedQuals = [...qualifications];

        if (editIndex !== null) {
            // Edit existing
            updatedQuals[editIndex] = { ...updatedQuals[editIndex], ...form };
            updateBackend(updatedQuals, 'Qualification updated!');
        } else {
            // Add new
            updatedQuals.push({ ...form });
            updateBackend(updatedQuals, 'Qualification added!');
        }
    };

    const handleDelete = (index) => {
        if (window.confirm("Are you sure you want to delete this qualification?")) {
            const updatedQuals = qualifications.filter((_, i) => i !== index);
            updateBackend(updatedQuals, 'Qualification deleted.');
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
                    <svg className="w-4 h-4" flex="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span>Add Qualification</span>
                </button>
            </div>

            {!facultyId && !loading && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm font-medium">
                    Warning: Your logged-in email does not currently match any faculty records in the public directory. Please ask the HOD to add a faculty profile for you before adding qualifications.
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase w-1/4">Degree</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase w-2/4">Institution</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase w-1/4">Year</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {qualifications.map((q, i) => (
                            <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{q.degree}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{q.institution}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{q.year}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => openEdit(q, i)} className="text-accent hover:text-accent-600 transition text-sm font-medium">Edit</button>
                                        <button onClick={() => handleDelete(i)} className="text-red-500 hover:text-red-700 transition text-sm font-medium">Delete</button>
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editIndex !== null ? 'Edit' : 'Add'} Qualification</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                                <input value={form.degree} onChange={e => setForm({ ...form, degree: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g., Ph.D. in Computer Science" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                                <input value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g., IIT Delhi" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year of Completion *</label>
                                <input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="2020" />
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
