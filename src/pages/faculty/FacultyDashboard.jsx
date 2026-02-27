import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import NoticeCard from '../../components/NoticeCard';

const notices = [
    { id: 1, title: 'Mid-Semester Examination Schedule Released', category: 'Exam', date: 'Feb 20, 2026', content: 'The mid-semester examination schedule has been published.', postedBy: 'Examination Cell', attachment: true },
    { id: 2, title: 'Workshop on Machine Learning', category: 'Events', date: 'Feb 10, 2026', content: '3-day workshop on ML and AI by CSE department.', postedBy: 'CSE Department', attachment: true },
    { id: 3, title: 'Holiday Notice — Holi', category: 'General', date: 'Feb 5, 2026', content: 'College will remain closed on March 17 for Holi.', postedBy: 'Principal Office', attachment: false },
];

const FacultyDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="animate-fade-in space-y-8">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white">
                <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Faculty'}! 👋</h1>
                <p className="text-blue-100 mt-1 text-sm">Here's your academic overview for today.</p>
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Profile Completion</h3>
                    <span className="text-sm font-bold text-accent">72%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-gradient-to-r from-accent to-primary h-3 rounded-full transition-all duration-500" style={{ width: '72%' }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Add publications and qualifications to complete your profile.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" label="Publications" value="12" color="bg-primary" />
                <StatCard icon="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" label="FDPs Attended" value="8" color="bg-accent" />
                <StatCard icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" label="Leave Balance" value="18" color="bg-emerald-500" />
                <StatCard icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" label="Subjects Teaching" value="3" color="bg-purple-500" />
            </div>

            {/* Recent Notices & Leave Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Notices</h2>
                    <div className="space-y-4">
                        {notices.map(n => <NoticeCard key={n.id} notice={n} />)}
                    </div>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Pending Leave Requests</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                        {[
                            { type: 'CL', dates: 'Mar 5-6, 2026', status: 'Pending', reason: 'Personal work' },
                            { type: 'OD', dates: 'Feb 28, 2026', status: 'Approved', reason: 'FDP at IIT Delhi' },
                            { type: 'ML', dates: 'Jan 15-20, 2026', status: 'Rejected', reason: 'Medical check-up' },
                        ].map((l, i) => (
                            <div key={i} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded mr-2">{l.type}</span>
                                        <span className="text-sm font-medium text-gray-900">{l.dates}</span>
                                    </div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${l.status === 'Approved' ? 'bg-green-100 text-green-700' : l.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{l.status}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{l.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
