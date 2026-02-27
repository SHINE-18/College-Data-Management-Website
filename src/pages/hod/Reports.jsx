import { useState } from 'react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const pubData = [
    { name: 'Dr. Sneha', Journal: 8, Conference: 5, Book: 1 },
    { name: 'Prof. Amit', Journal: 3, Conference: 4, Book: 0 },
    { name: 'Dr. Kavita', Journal: 6, Conference: 3, Book: 2 },
    { name: 'Prof. Deepak', Journal: 2, Conference: 6, Book: 0 },
    { name: 'Dr. Pooja', Journal: 10, Conference: 4, Book: 3 },
];

const tabsConfig = {
    'Publications Report': {
        columns: ['Faculty', 'Journal', 'Conference', 'Book', 'Patent', 'Total'],
        data: [
            { Faculty: 'Dr. Sneha Verma', Journal: 8, Conference: 5, Book: 1, Patent: 0, Total: 14 },
            { Faculty: 'Prof. Amit Joshi', Journal: 3, Conference: 4, Book: 0, Patent: 1, Total: 8 },
            { Faculty: 'Dr. Kavita Nair', Journal: 6, Conference: 3, Book: 2, Patent: 0, Total: 11 },
            { Faculty: 'Prof. Deepak Rao', Journal: 2, Conference: 6, Book: 0, Patent: 0, Total: 8 },
            { Faculty: 'Dr. Pooja Mehta', Journal: 10, Conference: 4, Book: 3, Patent: 2, Total: 19 },
        ],
    },
    'Workload Report': {
        columns: ['Faculty', 'Subjects', 'Weekly Hours', 'Avg Coverage'],
        data: [
            { Faculty: 'Dr. Sneha Verma', Subjects: 3, 'Weekly Hours': 10, 'Avg Coverage': '88%' },
            { Faculty: 'Prof. Amit Joshi', Subjects: 4, 'Weekly Hours': 14, 'Avg Coverage': '72%' },
            { Faculty: 'Dr. Kavita Nair', Subjects: 3, 'Weekly Hours': 9, 'Avg Coverage': '92%' },
            { Faculty: 'Prof. Deepak Rao', Subjects: 4, 'Weekly Hours': 12, 'Avg Coverage': '65%' },
            { Faculty: 'Dr. Pooja Mehta', Subjects: 2, 'Weekly Hours': 8, 'Avg Coverage': '95%' },
        ],
    },
    'FDP Report': {
        columns: ['Faculty', 'Attended', 'Conducted', 'Total Days'],
        data: [
            { Faculty: 'Dr. Sneha Verma', Attended: 5, Conducted: 2, 'Total Days': 28 },
            { Faculty: 'Prof. Amit Joshi', Attended: 8, Conducted: 1, 'Total Days': 35 },
            { Faculty: 'Dr. Kavita Nair', Attended: 4, Conducted: 3, 'Total Days': 30 },
            { Faculty: 'Prof. Deepak Rao', Attended: 6, Conducted: 0, 'Total Days': 22 },
            { Faculty: 'Dr. Pooja Mehta', Attended: 3, Conducted: 4, 'Total Days': 32 },
        ],
    },
    'NAAC Summary': {
        columns: ['Criterion', 'Parameter', 'Value', 'Weightage'],
        data: [
            { Criterion: 'Teaching', Parameter: 'Faculty with Ph.D.', Value: '80%', Weightage: 'High' },
            { Criterion: 'Research', Parameter: 'SCI Publications', Value: '32', Weightage: 'High' },
            { Criterion: 'Research', Parameter: 'Funded Projects', Value: '5', Weightage: 'Medium' },
            { Criterion: 'Training', Parameter: 'FDPs Conducted', Value: '10', Weightage: 'Medium' },
            { Criterion: 'Outcome', Parameter: 'Placement %', Value: '92%', Weightage: 'High' },
        ],
    },
};

const Reports = () => {
    const [activeTab, setActiveTab] = useState('Publications Report');
    const tab = tabsConfig[activeTab];

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                <p className="text-gray-500 text-sm mt-1">View and export departmental reports and analytics.</p>
            </div>

            <div className="flex flex-wrap gap-2">
                {Object.keys(tabsConfig).map(t => (
                    <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === t ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Chart for Publications */}
            {activeTab === 'Publications Report' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Publications per Faculty</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pubData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                <Legend />
                                <Bar dataKey="Journal" fill="#1a3c5e" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Conference" fill="#2980b9" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Book" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700">{activeTab}</h3>
                    <button onClick={() => toast.success('Excel export will be available when connected to backend.')} className="bg-accent/10 text-accent px-4 py-2 rounded-lg text-xs font-semibold hover:bg-accent/20 transition flex items-center space-x-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span>Export as Excel</span>
                    </button>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            {tab.columns.map(col => <th key={col} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">{col}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {tab.data.map((row, i) => (
                            <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                {tab.columns.map(col => <td key={col} className="px-6 py-3 text-sm text-gray-700">{row[col]}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
