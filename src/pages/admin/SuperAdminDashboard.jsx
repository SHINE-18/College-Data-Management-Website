import StatCard from '../../components/StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const deptStats = [
    { name: 'CSE', faculty: 42 },
    { name: 'ECE', faculty: 36 },
    { name: 'ME', faculty: 34 },
    { name: 'CE', faculty: 28 },
    { name: 'EE', faculty: 30 },
    { name: 'IT', faculty: 38 },
];

const SuperAdminDashboard = () => (
    <div className="animate-fade-in space-y-8">
        <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white">
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            <p className="text-blue-100 mt-1 text-sm">Cross-department overview and institutional management.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" label="Total Faculty" value="248" color="bg-primary" />
            <StatCard icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" label="Departments" value="6" color="bg-accent" />
            <StatCard icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" label="Publications" value="1,850" color="bg-purple-500" />
            <StatCard icon="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" label="Active Notices" value="42" color="bg-emerald-500" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Faculty Count by Department</h2>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                        <Bar dataKey="faculty" fill="#2980b9" radius={[6, 6, 0, 0]} name="Faculty Count" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

export default SuperAdminDashboard;
