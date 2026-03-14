import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import StatCard from '../../components/StatCard';
import NoticeCard from '../../components/NoticeCard';

const statusStyles = {
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    Pending: 'bg-yellow-100 text-yellow-700',
};

const FacultyDashboard = () => {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState({ publications: 0, achievements: 0, qualifications: 0, subjects: 0 });
    const [loading, setLoading] = useState(true);
    const [profileCompletion, setProfileCompletion] = useState(50);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [noticesRes, leavesRes, facultyRes] = await Promise.all([
                    api.get('/notices?limit=3&page=1'),
                    api.get('/leaves?status=Pending'),
                    user?.email ? api.get(`/faculty?search=${encodeURIComponent(user.email)}&limit=20`) : Promise.resolve({ data: { data: [] } }),
                ]);

                const noticeData = noticesRes.data.data || [];
                setNotices(noticeData.map((notice) => ({
                    ...notice,
                    id: notice._id,
                    date: new Date(notice.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                })));

                const facultyRecord = (facultyRes.data.data || []).find((faculty) => faculty.email === user?.email);
                const leaveData = Array.isArray(leavesRes.data) ? leavesRes.data.slice(0, 3) : [];
                setLeaves(leaveData);

                const publications = facultyRecord?.publications?.length || 0;
                const achievements = facultyRecord?.achievements?.length || 0;
                const qualifications = facultyRecord?.qualifications?.length || 0;

                setStats({
                    publications,
                    achievements,
                    qualifications,
                    subjects: facultyRecord?.subjectsTeaching || 0,
                });

                let completion = 40;
                if (facultyRecord?.phone) completion += 10;
                if (facultyRecord?.specialization) completion += 10;
                if (facultyRecord?.bio) completion += 10;
                if (qualifications > 0) completion += 10;
                if (publications > 0) completion += 10;
                if (achievements > 0) completion += 10;
                if (facultyRecord?.profilePhoto) completion += 10;
                setProfileCompletion(Math.min(100, completion));
            } catch (err) {
                console.error('Error loading dashboard:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user?.email]);

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="animate-fade-in space-y-6 md:space-y-8">
            <div className="bg-gradient-to-r from-primary-700 to-primary rounded-xl md:rounded-2xl p-4 md:p-8 text-white">
                <h1 className="text-xl md:text-2xl font-bold">Welcome back, {user?.name || 'Faculty'}!</h1>
                <p className="text-primary-100 mt-1 text-sm">Here&apos;s your academic overview for today.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">Profile Completion</h3>
                    <span className="text-sm font-bold text-accent">{profileCompletion}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className="bg-gradient-to-r from-accent to-primary h-3 rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Keep your profile updated so students and colleagues see accurate information.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" label="Publications" value={stats.publications} color="bg-primary" />
                <StatCard icon="M9 12l2 2 4-4m6-3a9 9 0 11-18 0 9 9 0 0118 0z" label="Achievements" value={stats.achievements} color="bg-accent" />
                <StatCard icon="M12 8c-1.657 0-3 1.343-3 3v7h6v-7c0-1.657-1.343-3-3-3zm7 10h1a1 1 0 001-1v-5a8 8 0 10-16 0v5a1 1 0 001 1h1" label="Qualifications" value={stats.qualifications} color="bg-emerald-500" />
                <StatCard icon="M3 7h18M6 3v4m12-4v4M5 11h14v8H5z" label="Subjects Teaching" value={stats.subjects} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Notices</h2>
                    <div className="space-y-3 md:space-y-4">
                        {notices.length > 0 ? (
                            notices.map((notice) => <NoticeCard key={notice.id} notice={notice} />)
                        ) : (
                            <p className="text-sm text-gray-500">No notices available</p>
                        )}
                    </div>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">My Leave Requests</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                        {leaves.length > 0 ? (
                            leaves.map((leave) => (
                                <div key={leave._id} className="p-3 md:p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">{leave.leaveType}</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusStyles[leave.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {leave.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{leave.reason}</p>
                                    {leave.remarks && <p className="text-xs text-gray-400 mt-1">Remarks: {leave.remarks}</p>}
                                </div>
                            ))
                        ) : (
                            <p className="p-3 text-sm text-gray-500">No leave requests found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
