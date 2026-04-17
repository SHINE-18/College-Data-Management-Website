import toast from 'react-hot-toast';

const workload = [
    { subject: 'Artificial Intelligence', branch: 'CSE', semester: 5, weeklyHours: 4, totalLectures: 48, coverage: 85 },
    { subject: 'Deep Learning', branch: 'CSE', semester: 7, weeklyHours: 3, totalLectures: 36, coverage: 72 },
    { subject: 'Research Methodology', branch: 'CSE', semester: 8, weeklyHours: 2, totalLectures: 24, coverage: 58 },
];

const WorkloadSheet = () => (
    <div className="animate-fade-in space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Workload Sheet</h1>
                <p className="text-gray-500 text-sm mt-1">Your current teaching workload and syllabus coverage.</p>
            </div>
            <button onClick={() => toast.success('PDF download will be available when connected to backend.')} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <span>Download PDF</span>
            </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                <p className="text-3xl font-bold text-primary">{workload.reduce((a, w) => a + w.weeklyHours, 0)}</p>
                <p className="text-sm text-gray-500 mt-1">Weekly Hours</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                <p className="text-3xl font-bold text-accent">{workload.length}</p>
                <p className="text-sm text-gray-500 mt-1">Subjects</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                <p className="text-3xl font-bold text-emerald-500">{Math.round(workload.reduce((a, w) => a + w.coverage, 0) / workload.length)}%</p>
                <p className="text-sm text-gray-500 mt-1">Avg. Coverage</p>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Branch</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Semester</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Weekly Hours</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total Lectures</th>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">% Coverage</th>
                    </tr>
                </thead>
                <tbody>
                    {workload.map((w, i) => (
                        <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{w.subject}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{w.branch}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{w.semester}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{w.weeklyHours}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{w.totalLectures}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-1 bg-gray-100 rounded-full h-2 max-w-[120px]">
                                        <div className={`h-2 rounded-full ${w.coverage >= 75 ? 'bg-green-500' : w.coverage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${w.coverage}%` }}></div>
                                    </div>
                                    <span className={`text-sm font-semibold ${w.coverage >= 75 ? 'text-green-600' : w.coverage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>{w.coverage}%</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default WorkloadSheet;
