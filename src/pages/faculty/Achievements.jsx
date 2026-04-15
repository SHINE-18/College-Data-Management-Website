import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const tabsConfig = {
    'FDPs Attended': {
        columns: ['Program', 'Organizer', 'Duration', 'Year'],
        fields: ['Program', 'Organizer', 'Duration', 'Year'],
        achievementType: 'Other',
    },
    'FDPs Conducted': {
        columns: ['Program', 'Participants', 'Duration', 'Year'],
        fields: ['Program', 'Participants', 'Duration', 'Year'],
        achievementType: 'Other',
    },
    Awards: {
        columns: ['Award Title', 'Awarded By', 'Year'],
        fields: ['Award Title', 'Awarded By', 'Year'],
        achievementType: 'Award',
    },
    Memberships: {
        columns: ['Organization', 'Membership Type', 'Since'],
        fields: ['Organization', 'Membership Type', 'Since'],
        achievementType: 'Recognition',
    },
    'Expert Talks': {
        columns: ['Topic', 'Venue', 'Date', 'Audience'],
        fields: ['Topic', 'Venue', 'Date', 'Audience'],
        achievementType: 'Other',
    },
};

const encodeFieldsToBackend = (category, dataObj) => {
    const title = dataObj.Program || dataObj['Award Title'] || dataObj.Organization || dataObj.Topic || 'Achievement';
    const date = dataObj.Year || dataObj.Since || dataObj.Date || new Date().getFullYear().toString();
    const description = JSON.stringify({ category, ...dataObj });
    return {
        title,
        description,
        date,
        achievementType: tabsConfig[category]?.achievementType || 'Other',
        issuingOrganization: dataObj.Organizer || dataObj['Awarded By'] || dataObj.Venue || dataObj.Organization || ''
    };
};

const decodeBackendToFrontend = (backendArray) => {
    const decodedData = {};
    Object.keys(tabsConfig).forEach(tab => {
        decodedData[tab] = [];
    });

    (backendArray || []).forEach(item => {
        try {
            const parsed = JSON.parse(item.description);
            if (parsed.category && decodedData[parsed.category]) {
                decodedData[parsed.category].push({ ...parsed, _id: item._id });
                return;
            }
        } catch {
            // Fall through to legacy mapping below.
        }

        decodedData.Awards.push({
            _id: item._id,
            'Award Title': item.title,
            'Awarded By': item.issuingOrganization || item.description,
            Year: item.date ? new Date(item.date).getFullYear() : ''
        });
    });

    return decodedData;
};

const Achievements = () => {
    const { user } = useAuth();
    const [facultyId, setFacultyId] = useState(null);
    const [activeTab, setActiveTab] = useState('FDPs Attended');
    const [allData, setAllData] = useState(() => {
        const initial = {};
        Object.keys(tabsConfig).forEach(tab => {
            initial[tab] = [];
        });
        return initial;
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({});

    const loadAchievements = async (resolvedFacultyId) => {
        const response = await api.get(`/achievements/faculty/${resolvedFacultyId}`);
        setAllData(decodeBackendToFrontend(Array.isArray(response.data) ? response.data : []));
    };

    useEffect(() => {
        const fetchAchievements = async () => {
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
                    await loadAchievements(myProfile._id);
                }
            } catch (error) {
                console.error('Failed to fetch achievements', error);
                toast.error('Failed to load achievements');
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, [user]);

    const tabConfig = tabsConfig[activeTab];
    const currentTabData = allData[activeTab] || [];

    const openAdd = () => {
        const newForm = {};
        tabConfig.fields.forEach(field => {
            newForm[field] = '';
        });
        setForm(newForm);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!facultyId) {
            toast.error('Faculty profile not found!');
            return;
        }

        const missing = tabConfig.fields.some(field => !form[field]);
        if (missing) {
            toast.error('Please fill all fields.');
            return;
        }

        try {
            setSaving(true);
            await api.post('/achievements', encodeFieldsToBackend(activeTab, form));
            toast.success('Entry added successfully!');
            await loadAchievements(facultyId);
            setShowModal(false);
        } catch (error) {
            console.error('Failed to save achievement', error);
            toast.error(error.response?.data?.message || 'Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (achievementId) => {
        if (!window.confirm('Delete this entry?')) {
            return;
        }

        try {
            await api.delete(`/achievements/${achievementId}`);
            toast.success('Entry deleted.');
            if (facultyId) {
                await loadAchievements(facultyId);
            }
        } catch (error) {
            console.error('Failed to delete achievement', error);
            toast.error(error.response?.data?.message || 'Failed to delete entry');
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
                    <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your FDPs, awards, memberships, and expert talks.</p>
                </div>
            </div>

            {!facultyId && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm font-medium">
                    Warning: Your logged-in email does not currently match any faculty records in the public directory. Please ask the HOD to add a faculty profile for you before adding achievements.
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {Object.keys(tabsConfig).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700">{activeTab} ({currentTabData.length} entries)</h3>
                    <button onClick={openAdd} disabled={!facultyId} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md flex items-center space-x-1 disabled:opacity-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span>Add</span>
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                {tabConfig.columns.map(column => (
                                    <th key={column} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{column}</th>
                                ))}
                                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTabData.map((row, index) => (
                                <tr key={row._id || index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                    {tabConfig.columns.map(column => (
                                        <td key={column} className="px-6 py-4 text-sm text-gray-700">{row[column]}</td>
                                    ))}
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(row._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {currentTabData.length === 0 && <div className="text-center py-12 text-gray-400"><p>No entries yet.</p></div>}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Add {activeTab}</h2>
                        <div className="space-y-4">
                            {tabConfig.fields.map(field => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{field} *</label>
                                    <input value={form[field] || ''} onChange={e => setForm({ ...form, [field]: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={() => setShowModal(false)} disabled={saving} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">Cancel</button>
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

export default Achievements;
