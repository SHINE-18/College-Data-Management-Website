import { useState } from 'react';
import toast from 'react-hot-toast';

const MyProfile = () => {
    const [form, setForm] = useState({
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.k@college.edu',
        phone: '+91 98765 43210',
        designation: 'Professor & HOD',
        department: 'Computer Science & Engineering',
        joiningDate: '2008-07-15',
        specialization: 'Artificial Intelligence',
        bio: 'Experienced professor with 16+ years in teaching and research. Specializing in AI, ML and Deep Learning with over 40 publications in reputed journals.',
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name || !form.email) { toast.error('Name and Email are required.'); return; }
        toast.success('Profile updated successfully!');
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-500 text-sm mt-1">Update your personal and professional information.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
                {/* Photo */}
                <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-100">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-3xl">{form.name[0]}</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{form.name}</h3>
                        <p className="text-sm text-gray-500">{form.designation}</p>
                        <button type="button" className="mt-2 text-sm text-accent font-medium hover:text-accent-600 transition">Change Photo</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input name="name" value={form.name} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition bg-gray-50" readOnly />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <select name="designation" value={form.designation} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white">
                            {['Professor & HOD', 'Professor', 'Associate Professor', 'Assistant Professor'].map(d => <option key={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input name="department" value={form.department} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50" readOnly />
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
                        <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition resize-none" />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button id="save-profile" type="submit" className="bg-primary text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary/25">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MyProfile;
