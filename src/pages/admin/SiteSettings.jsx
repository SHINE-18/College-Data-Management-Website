import { useState } from 'react';
import toast from 'react-hot-toast';

const SiteSettings = () => {
    const [form, setForm] = useState({
        collegeName: 'College of Engineering & Technology',
        email: 'info@collegeportal.edu',
        phone: '+91 80 1234 5678',
        address: '123 College Avenue, Education City, State - 560001',
        website: 'https://www.collegeportal.edu',
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.collegeName || !form.email) { toast.error('College name and email are required.'); return; }
        toast.success('Settings saved successfully!');
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Manage college-wide settings and configuration.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
                <div className="space-y-6">
                    {/* Logo */}
                    <div className="flex items-center space-x-6 pb-6 border-b border-gray-100">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">CP</span>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">College Logo</h3>
                            <p className="text-sm text-gray-500">Upload a new logo for the portal.</p>
                            <input type="file" accept="image/*" className="mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent/10 file:text-accent hover:file:bg-accent/20" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">College Name *</label>
                            <input name="collegeName" value={form.collegeName} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input name="phone" value={form.phone} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea name="address" value={form.address} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none resize-none" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                            <input name="website" value={form.website} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button type="submit" className="bg-primary text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary/25">Save Settings</button>
                </div>
            </form>
        </div>
    );
};

export default SiteSettings;
