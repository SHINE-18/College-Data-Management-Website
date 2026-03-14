import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const tabsConfig = {
    'FDPs Attended': {
        columns: ['Program', 'Organizer', 'Duration', 'Year'],
        fields: ['Program', 'Organizer', 'Duration', 'Year'],
    },
    'FDPs Conducted': {
        columns: ['Program', 'Participants', 'Duration', 'Year'],
        fields: ['Program', 'Participants', 'Duration', 'Year'],
    },
    'Awards': {
        columns: ['Award Title', 'Awarded By', 'Year'],
        fields: ['Award Title', 'Awarded By', 'Year'],
    },
    'Memberships': {
        columns: ['Organization', 'Membership Type', 'Since'],
        fields: ['Organization', 'Membership Type', 'Since'],
    },
    'Expert Talks': {
        columns: ['Topic', 'Venue', 'Date', 'Audience'],
        fields: ['Topic', 'Venue', 'Date', 'Audience'],
    },
};

const Achievements = () => {
    const { user } = useAuth();
    const [facultyId, setFacultyId] = useState(null);
    const [activeTab, setActiveTab] = useState('FDPs Attended');
    const [achievements, setAchievements] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({});

    // The backend only accepts: title, description, date
    // We map custom fields to this structure and encode the category in the description using a JSON string to easily parse it back
    const encodeFieldsToBackend = (category, dataObj) => {
        let title = dataObj.Program || dataObj['Award Title'] || dataObj.Organization || dataObj.Topic || 'Achievement';
        let date = dataObj.Year || dataObj.Since || dataObj.Date || new Date().getFullYear().toString();

        // Store all original data in the description as JSON string so we can perfectly reconstruct the dynamic columns
        let description = JSON.stringify({ category, ...dataObj });

        return { title, description, date };
    };

    const decodeBackendToFrontend = (backendArray) => {
        let decodedData = {};
        Object.keys(tabsConfig).forEach(tab => decodedData[tab] = []);

        if (!backendArray) return decodedData;

        backendArray.forEach(item => {
            try {
                let parsed = JSON.parse(item.description);
                if (parsed.category && decodedData[parsed.category]) {
                    // Copy original backend ID just in case
                    parsed._id = item._id;
                    decodedData[parsed.category].push(parsed);
                } else {
                    // Fallback if parsing fails or category doesn't exist
                    decodedData['Awards'].push({
                        _id: item._id,
                        'Award Title': item.title,
                        'Awarded By': item.description,
                        'Year': item.date
                    });
                }
            } catch (e) {
                // Fallback for generic legacy data
                decodedData['Awards'].push({
                    _id: item._id,
                    'Award Title': item.title,
                    'Awarded By': item.description,
                    'Year': item.date
                });
            }
        });

        return decodedData;
    };

    const [allData, setAllData] = useState(() => {
        let initial = {};
        Object.keys(tabsConfig).forEach(t => initial[t] = []);
        return initial;
    });

    useEffect(() => {
        const fetchAchievements = async () => {
            if (!user?.email) return;
            try {
                const response = await api.get(`/faculty?search=${encodeURIComponent(user.email)}`);
                const facultyList = response.data.data;

                if (facultyList && facultyList.length > 0) {
                    const myProfile = facultyList.find(f => f.email === user.email);
                    if (myProfile) {
                        setFacultyId(myProfile._id);
                        setAchievements(myProfile.achievements || []);
                        setAllData(decodeBackendToFrontend(myProfile.achievements));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch achievements", error);
                toast.error("Failed to load achievements");
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
        tabConfig.fields.forEach(f => newForm[f] = '');
        setForm(newForm);
        setShowModal(true);
    };

    const updateBackend = async (newAllData, successMessage) => {
        if (!facultyId) {
            toast.error("Faculty profile not found!");
            return;
        }

        // Flatten all categories back into the single array for the backend
        let flattenedArray = [];
        Object.keys(newAllData).forEach(category => {
            newAllData[category].forEach(item => {
                flattenedArray.push(encodeFieldsToBackend(category, item));
            });
        });

        try {
            setSaving(true);
            await api.put(`/faculty/${facultyId}`, { achievements: flattenedArray });
            setAchievements(flattenedArray);
            setAllData(newAllData);
            toast.success(successMessage);
            setShowModal(false);
        } catch (error) {
            console.error("Failed to update", error);
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const handleSave = () => {
        const missing = tabConfig.fields.some(f => !form[f]);
        if (missing) { toast.error('Please fill all fields.'); return; }

        const newAllData = {
            ...allData,
            [activeTab]: [...currentTabData, { ...form, frontendId: Date.now() }]
        };

        updateBackend(newAllData, 'Entry added successfully!');
    };

    const handleDelete = (indexToDelete) => {
        if (window.confirm("Delete this entry?")) {
            const newAllData = {
                ...allData,
                [activeTab]: currentTabData.filter((_, idx) => idx !== indexToDelete)
            };
            updateBackend(newAllData, 'Entry deleted.');
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

            {!facultyId && !loading && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm font-medium">
                    Warning: Your logged-in email does not currently match any faculty records in the public directory. Please ask the HOD to add a faculty profile for you before adding achievements.
                </div>
            )}

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {Object.keys(tabsConfig).map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === t ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Table */}
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
                                {tabConfig.columns.map(col => (
                                    <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{col}</th>
                                ))}
                                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentTabData.map((row, i) => (
                                <tr key={row._id || row.frontendId || i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                    {tabConfig.columns.map(col => (
                                        <td key={col} className="px-6 py-4 text-sm text-gray-700">{row[col]}</td>
                                    ))}
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(i)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {currentTabData.length === 0 && <div className="text-center py-12 text-gray-400"><p>No entries yet.</p></div>}
            </div>

            {/* Modal */}
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
