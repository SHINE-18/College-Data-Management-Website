import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import StatCard from '../../components/StatCard';
import NoticeCard from '../../components/NoticeCard';
import { FiBook, FiAward, FiBookmark, FiMap, FiCalendar, FiCompass, FiBriefcase, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusStyles = {
    Approved: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
    Rejected: 'bg-rose-50 text-rose-700 border border-rose-100',
    Pending: 'bg-amber-50 text-amber-700 border border-amber-100',
};

const FacultyDashboard = () => {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [stats, setStats] = useState({ publications: 0, achievements: 0, qualifications: 0, subjects: 0 });
    const [loading, setLoading] = useState(true);
    const [profileCompletion, setProfileCompletion] = useState(50);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
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
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [user?.email]);

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-28 bg-white border border-gray-100 rounded-3xl"></div>
                <div className="h-24 bg-white border border-gray-100 rounded-2xl"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white border border-gray-100 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Ambient Header Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-8 text-white shadow-xl shadow-primary-950/10 border border-primary-800">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary-400/20 rounded-full blur-2xl opacity-40"></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wider text-accent-300 uppercase mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Faculty Portal Active
                        </span>
                        <h1 className="text-3xl font-extrabold tracking-tight font-heading mb-1">
                            Welcome back, {user?.name?.split(' ')[0]}!
                        </h1>
                        <p className="text-primary-100/90 text-sm font-medium">
                            Manage department curriculum, track leaves, and upload student grades.
                        </p>
                    </div>
                    <button 
                        onClick={fetchDashboardData}
                        className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white transition backdrop-blur-md self-start sm:self-center"
                        title="Reload Dashboard"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Profile Completion Indicator */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-6 shadow-sm card-hover flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Profile Completeness</span>
                        <span className="text-sm font-black text-accent">{profileCompletion}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-accent to-primary h-full rounded-full transition-all duration-1000" style={{ width: `${profileCompletion}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                        Ensure qualifications, publications, achievements, and a profile photo are loaded so colleagues and students can see correct data.
                    </p>
                </div>
                {profileCompletion < 100 && (
                    <a 
                        href="/faculty-portal/profile" 
                        className="inline-flex items-center justify-center bg-accent hover:bg-accent/90 text-white font-extrabold text-xs uppercase tracking-wider px-5 py-3 rounded-2xl shadow-md shadow-accent/15 transition-all shrink-0"
                    >
                        Update Profile
                    </a>
                )}
            </div>

            {/* Premium Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 stagger-fade-in">
                <StatCard 
                    icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                    label="Publications" 
                    value={stats.publications} 
                    color="bg-primary" 
                />
                <StatCard 
                    icon="M9 12l2 2 4-4m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    label="Achievements" 
                    value={stats.achievements} 
                    color="bg-accent" 
                />
                <StatCard 
                    icon="M12 8c-1.657 0-3 1.343-3 3v7h6v-7c0-1.657-1.343-3-3-3zm7 10h1a1 1 0 001-1v-5a8 8 0 10-16 0v5a1 1 0 001 1h1" 
                    label="Qualifications" 
                    value={stats.qualifications} 
                    color="bg-emerald-500" 
                />
                <StatCard 
                    icon="M3 7h18M6 3v4m12-4v4M5 11h14v8H5z" 
                    label="Teaching Loads" 
                    value={stats.subjects} 
                    color="bg-purple-500" 
                />
            </div>

            {/* Split Column Panel for leaves and notices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Notices */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <div>
                            <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <FiCompass className="text-primary" /> Institutional Circulars
                            </h2>
                            <p className="text-xs text-gray-400">Important updates across campus</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4 stagger-fade-in">
                        {notices.length > 0 ? (
                            notices.map((notice) => <NoticeCard key={notice.id} notice={notice} />)
                        ) : (
                            <div className="bg-white/80 border border-gray-200/60 rounded-3xl p-12 text-center text-gray-400 text-xs">
                                No recent circulars posted.
                            </div>
                        )}
                    </div>
                </div>

                {/* My Leave Requests */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <div>
                            <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                <FiBriefcase className="text-accent" /> Pending Leave Status
                            </h2>
                            <p className="text-xs text-gray-400">Status of your outstanding leave queries</p>
                        </div>
                        <a 
                            href="/faculty-portal/leave" 
                            className="text-xs font-bold text-primary hover:text-accent uppercase tracking-wider transition"
                        >
                            Request Leave
                        </a>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl divide-y divide-gray-100 overflow-hidden shadow-sm">
                        {leaves.length > 0 ? (
                            leaves.map((leave) => (
                                <div key={leave._id} className="p-5 hover:bg-gray-50/50 transition-colors group">
                                    <div className="flex items-center justify-between gap-3 flex-wrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200">
                                                {leave.leaveType}
                                            </span>
                                            <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                                                <FiCalendar className="text-gray-300" /> {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${statusStyles[leave.status] || 'bg-gray-50 text-gray-600'}`}>
                                            {leave.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">{leave.reason}</p>
                                    {leave.remarks && (
                                        <div className="mt-2.5 p-2 bg-slate-50 border border-slate-100 rounded-xl text-[11px] text-gray-400 font-semibold italic">
                                            HOD Note: {leave.remarks}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-gray-400 text-xs">
                                No pending leave requests at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
