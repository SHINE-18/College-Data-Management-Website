import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api, { getAssetUrl } from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const MyProfile = () => {
    const { user } = useAuth();
    const [facultyId, setFacultyId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        designation: '',
        department: '',
        joiningDate: '',
        specialization: '',
        bio: '',
        profilePhoto: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        const fetchMyProfile = async () => {
            if (!user?.email) return;

            try {
                // Find the faculty record matching the logged-in user's email
                const response = await api.get(`/faculty?search=${encodeURIComponent(user.email)}`);
                const facultyList = response.data.data;

                // If a matching faculty object is found, populate the form
                if (facultyList && facultyList.length > 0) {
                    // Match exact email
                    const myProfile = facultyList.find(f => f.email === user.email);

                    if (myProfile) {
                        setFacultyId(myProfile._id);
                        setForm({
                            name: myProfile.name || '',
                            email: myProfile.email || '',
                            phone: myProfile.phone || '',
                            designation: myProfile.designation || '',
                            department: myProfile.department || '',
                            joiningDate: myProfile.joiningDate ? new Date(myProfile.joiningDate).toISOString().split('T')[0] : '',
                            specialization: myProfile.specialization || '',
                            bio: myProfile.bio || '',
                            profilePhoto: myProfile.profilePhoto || ''
                        });
                        if (myProfile.profilePhoto) {
                            setPreviewUrl(getAssetUrl(myProfile.profilePhoto));
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchMyProfile();
    }, [user]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size too large (max 5MB)');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email) { toast.error('Name and Email are required.'); return; }

        if (!facultyId) {
            toast.error("Cannot update profile: Faculty record not found linking to this email.");
            return;
        }

        try {
            setSaving(true);
            const formData = new FormData();

            // Append all form fields to FormData
            Object.keys(form).forEach(key => {
                if (key !== 'profilePhoto') {
                    formData.append(key, form[key]);
                }
            });

            // Append selected file if exists
            if (selectedFile) {
                formData.append('profilePhoto', selectedFile);
            }

            const response = await api.put(`/faculty/${facultyId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setForm(prev => ({ ...prev, profilePhoto: response.data.profilePhoto }));
            setPreviewUrl(getAssetUrl(response.data.profilePhoto));
            setSelectedFile(null);

            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error("Failed to update profile", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-500 text-sm mt-1">Update your personal and professional information.</p>
            </div>

            {!facultyId && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm font-medium">
                    Warning: Your logged-in email does not currently match any faculty records in the public directory. Please ask the HOD to add a faculty profile for you.
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
                {/* Photo */}
                <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-100">
                    <div className="relative group">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-white">
                            {previewUrl ? (
                                <img src={previewUrl} alt={form.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-white font-bold text-3xl">{form.name?.[0] || 'U'}</span>
                            )}
                        </div>
                        <label className="absolute -bottom-2 -right-2 bg-white text-primary p-2 rounded-lg shadow-md cursor-pointer hover:bg-gray-50 transition border border-gray-100">
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </label>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{form.name || 'Your Name'}</h3>
                        <p className="text-sm text-gray-500">{form.designation || 'Your Designation'}</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Accepted: JPG, PNG, GIF (Max 5MB)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input name="email" type="email" value={form.email || user?.email} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" title="Email cannot be changed" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <select name="designation" value={form.designation} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white">
                            <option value="">Select Designation...</option>
                            {['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'].map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input name="department" value={form.department || user?.department} disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
                        <input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                        <input name="specialization" value={form.specialization} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition resize-none" placeholder="Write a short biography..." />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button disabled={saving || !facultyId} type="submit" className="bg-primary text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary/25 disabled:opacity-70 flex items-center gap-2">
                        {saving ? (
                            <><span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></span> Saving...</>
                        ) : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MyProfile;
