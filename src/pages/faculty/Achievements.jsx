import { useState } from 'react';
import toast from 'react-hot-toast';

const tabsData = {
    'FDPs Attended': {
        columns: ['Program', 'Organizer', 'Duration', 'Year'],
        data: [
            { id: 1, Program: 'FDP on Machine Learning & Deep Learning', Organizer: 'IIT Bombay', Duration: '5 Days', Year: 2024 },
            { id: 2, Program: 'Workshop on Research Paper Writing', Organizer: 'Springer Nature', Duration: '3 Days', Year: 2023 },
            { id: 3, Program: 'FDP on Cloud & Edge Computing', Organizer: 'IISC Bangalore', Duration: '1 Week', Year: 2022 },
        ],
        fields: ['Program', 'Organizer', 'Duration', 'Year'],
    },
    'FDPs Conducted': {
        columns: ['Program', 'Participants', 'Duration', 'Year'],
        data: [
            { id: 1, Program: 'FDP on Python for Data Science', Participants: '45 Faculty', Duration: '5 Days', Year: 2024 },
            { id: 2, Program: 'Workshop on AI Tools for Education', Participants: '30 Faculty', Duration: '3 Days', Year: 2023 },
        ],
        fields: ['Program', 'Participants', 'Duration', 'Year'],
    },
    'Awards': {
        columns: ['Award Title', 'Awarded By', 'Year'],
        data: [
            { id: 1, 'Award Title': 'Best Researcher Award', 'Awarded By': 'University', Year: 2024 },
            { id: 2, 'Award Title': 'Outstanding Faculty Award', 'Awarded By': 'AICTE', Year: 2023 },
            { id: 3, 'Award Title': 'Best Paper Award', 'Awarded By': 'IEEE Conference', Year: 2022 },
        ],
        fields: ['Award Title', 'Awarded By', 'Year'],
    },
    'Memberships': {
        columns: ['Organization', 'Membership Type', 'Since'],
        data: [
            { id: 1, Organization: 'IEEE', 'Membership Type': 'Senior Member', Since: 2015 },
            { id: 2, Organization: 'ACM', 'Membership Type': 'Professional Member', Since: 2012 },
            { id: 3, Organization: 'CSI', 'Membership Type': 'Life Member', Since: 2010 },
        ],
        fields: ['Organization', 'Membership Type', 'Since'],
    },
    'Expert Talks': {
        columns: ['Topic', 'Venue', 'Date', 'Audience'],
        data: [
            { id: 1, Topic: 'AI in Healthcare', Venue: 'NIT Trichy', Date: 'Jan 2024', Audience: '200+ participants' },
            { id: 2, Topic: 'Future of Computing', Venue: 'TechFest 2023', Date: 'Nov 2023', Audience: '500+ participants' },
        ],
        fields: ['Topic', 'Venue', 'Date', 'Audience'],
    },
};

const Achievements = () => {
    const [activeTab, setActiveTab] = useState('FDPs Attended');
    const [allData, setAllData] = useState(tabsData);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({});

    const tab = allData[activeTab];

    const openAdd = () => {
        const newForm = {};
        tab.fields.forEach(f => newForm[f] = '');
        setForm(newForm);
        setShowModal(true);
    };

    const handleSave = () => {
        const missing = tab.fields.some(f => !form[f]);
        if (missing) { toast.error('Please fill all fields.'); return; }
        setAllData(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                data: [...prev[activeTab].data, { ...form, id: Date.now() }],
            },
        }));
        toast.success('Entry added!');
        setShowModal(false);
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your FDPs, awards, memberships, and expert talks.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {Object.keys(allData).map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === t ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700">{activeTab} ({tab.data.length} entries)</h3>
                    <button onClick={openAdd} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span>Add</span>
                    </button>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {tab.columns.map(col => (
                                <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tab.data.map((row, i) => (
                            <tr key={row.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                {tab.columns.map(col => (
                                    <td key={col} className="px-6 py-3 text-sm text-gray-700">{row[col]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {tab.data.length === 0 && <div className="text-center py-12 text-gray-400"><p>No entries yet.</p></div>}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Add {activeTab}</h2>
                        <div className="space-y-4">
                            {tab.fields.map(field => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{field} *</label>
                                    <input value={form[field] || ''} onChange={e => setForm({ ...form, [field]: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                            <button onClick={handleSave} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Achievements;
