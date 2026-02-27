import StatCard from '../../components/StatCard';
import toast from 'react-hot-toast';

const facultyList = [
    { id: 1, name: 'Dr. Sneha Verma', designation: 'Associate Professor', completion: 92 },
    { id: 2, name: 'Prof. Amit Joshi', designation: 'Assistant Professor', completion: 78 },
    { id: 3, name: 'Dr. Kavita Nair', designation: 'Associate Professor', completion: 85 },
    { id: 4, name: 'Prof. Deepak Rao', designation: 'Assistant Professor', completion: 65 },
    { id: 5, name: 'Dr. Pooja Mehta', designation: 'Professor', completion: 95 },
];

const recentLeaves = [
    { id: 1, faculty: 'Prof. Amit Joshi', type: 'CL', dates: 'Mar 5-6, 2026', reason: 'Personal work' },
    { id: 2, faculty: 'Dr. Kavita Nair', type: 'OD', dates: 'Mar 10, 2026', reason: 'Conference at IIT Hyderabad' },
    { id: 3, faculty: 'Prof. Deepak Rao', type: 'ML', dates: 'Mar 12-15, 2026', reason: 'Medical checkup' },
];

const HODDashboard = () => (
    <div className="animate-fade-in space-y-8">
        <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white">
            <h1 className="text-2xl font-bold">HOD Dashboard — ECE Department</h1>
            <p className="text-blue-100 mt-1 text-sm">Manage your department, faculty, and academic operations.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" label="Total Faculty" value="24" color="bg-primary" />
            <StatCard icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" label="Pending Leaves" value="3" color="bg-yellow-500" />
            <StatCard icon="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" label="Unread Circulars" value="5" color="bg-red-500" />
            <StatCard icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" label="Total Publications" value="156" color="bg-accent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Faculty Profiles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Faculty Profile Completion</h2>
                <div className="space-y-4">
                    {facultyList.map(f => (
                        <div key={f.id} className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">{f.name[0]}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">{f.name}</p>
                                    <span className="text-xs font-semibold text-accent">{f.completion}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${f.completion >= 90 ? 'bg-green-500' : f.completion >= 70 ? 'bg-accent' : 'bg-yellow-500'}`} style={{ width: `${f.completion}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Leave Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Leave Requests</h2>
                <div className="space-y-4">
                    {recentLeaves.map(l => (
                        <div key={l.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{l.faculty}</p>
                                    <p className="text-xs text-gray-500">{l.reason} • {l.dates}</p>
                                </div>
                                <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{l.type}</span>
                            </div>
                            <div className="flex space-x-2 mt-3">
                                <button onClick={() => toast.success(`Leave approved for ${l.faculty}`)} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600 transition">Approve</button>
                                <button onClick={() => toast.error(`Leave rejected for ${l.faculty}`)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition">Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default HODDashboard;
