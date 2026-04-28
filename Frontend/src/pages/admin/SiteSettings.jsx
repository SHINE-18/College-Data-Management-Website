import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';

const SiteSettings = () => {
    const [form, setForm] = useState({
        collegeName: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        established: '1994',
        ugBranches: '12',
        totalStudents: '5000+',
        naacGrade: 'A Grade',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [syncingGtu, setSyncingGtu] = useState(false);

    // Load existing settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                setForm({
                    collegeName: data.collegeName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    website: data.website || '',
                    established: data.established || '1994',
                    ugBranches: data.ugBranches || '12',
                    totalStudents: data.totalStudents || '5000+',
                    naacGrade: data.naacGrade || 'A Grade',
                });
            } catch (err) {
                console.error('Failed to load settings:', err);
                toast.error('Failed to load settings.');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.collegeName || !form.email) { toast.error('College name and email are required.'); return; }
        setSaving(true);
        try {
            await api.put('/settings', form);
            toast.success('Settings saved successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const handleGtuSync = async () => {
        setSyncingGtu(true);
        try {
            const { data } = await api.post('/admin/sync/gtu');
            toast.success(data.message || `Imported ${data.imported || 0} GTU notices.`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to sync GTU circulars.');
        } finally {
            setSyncingGtu(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
                <p className="text-gray-500 text-sm mt-1">Manage college-wide settings and configuration.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">GTU Circular Sync</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Pull the latest engineering-related GTU circulars into your public notice board.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleGtuSync}
                    disabled={syncingGtu}
                    className="bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent/90 transition shadow-lg shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {syncingGtu ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    {syncingGtu ? 'Syncing GTU...' : 'Sync GTU Circulars'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
                <div className="space-y-6">
                    {/* Logo placeholder */}
                    <div className="flex items-center space-x-6 pb-6 border-b border-gray-100">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-2xl">VG</span>
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

                    {/* Homepage Stats Bar */}
                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 mb-1">Homepage Stats Bar</h3>
                        <p className="text-xs text-gray-400 mb-4">These values appear in the stats section on the public homepage.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Est. Year</label>
                                <input name="established" value={form.established} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="1994" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">UG Branches</label>
                                <input name="ugBranches" value={form.ugBranches} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="12" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Total Students</label>
                                <input name="totalStudents" value={form.totalStudents} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="5000+" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">NAAC Grade</label>
                                <input name="naacGrade" value={form.naacGrade} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="A Grade" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SiteSettings;
