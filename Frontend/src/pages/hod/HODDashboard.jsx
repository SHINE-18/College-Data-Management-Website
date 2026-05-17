import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import StatCard from '../../components/StatCard';
import toast from 'react-hot-toast';
import { FiUsers, FiAward, FiBook, FiBriefcase, FiRefreshCw, FiTrendingUp, FiUploadCloud, FiCheck, FiX, FiCalendar } from 'react-icons/fi';

const HODDashboard = () => {
    const { user } = useAuth();
    const [facultyList, setFacultyList] = useState([]);
    const [recentLeaves, setRecentLeaves] = useState([]);
    const [stats, setStats] = useState({ totalFaculty: 0, pendingLeaves: 0, circulars: 0, publications: 0 });
    const [loading, setLoading] = useState(true);
    const [uploadingCalendar, setUploadingCalendar] = useState(false);
    const [myFacultyId, setMyFacultyId] = useState(null);

    const fetchHODData = async () => {
        try {
            setLoading(true);
            const [facultyRes, leavesRes, noticesRes, meRes] = await Promise.all([
                api.get('/faculty/admin/all'),
                api.get('/leaves/pending'),
                api.get(`/notices?department=${encodeURIComponent(user?.department || '')}&limit=10&page=1`),
                api.get('/faculty/me')
            ]);

            if (meRes.data) {
                setMyFacultyId(meRes.data._id);
            }

            const faculty = Array.isArray(facultyRes.data) ? facultyRes.data : [];
            const leaves = Array.isArray(leavesRes.data) ? leavesRes.data.slice(0, 5) : [];
            const notices = noticesRes.data.data || [];
            const totalNoticeCount = noticesRes.data.pagination?.total ?? notices.length;

            setFacultyList(faculty);
            setRecentLeaves(leaves);
            setStats({
                totalFaculty: faculty.length,
                pendingLeaves: leaves.length,
                circulars: totalNoticeCount,
                publications: faculty.reduce((total, item) => total + (item.publications?.length || 0), 0),
            });
        } catch (err) {
            console.error('Error loading HOD dashboard:', err);
            toast.error('Error loading dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHODData();
    }, [user?.department]);

    const getProfileCompletion = (faculty) => {
        let completion = 30;
        if (faculty.phone) completion += 10;
        if (faculty.specialization) completion += 10;
        if (faculty.bio) completion += 10;
        if (faculty.profilePhoto) completion += 10;
        if (faculty.qualifications?.length) completion += 10;
        if (faculty.publications?.length) completion += 10;
        if (faculty.achievements?.length) completion += 10;
        return Math.min(100, completion);
    };

    const handleApproveLeave = async (leaveId, facultyName) => {
        try {
            await api.put(`/leaves/${leaveId}/approve`, { remarks: 'Approved by HOD' });
            toast.success(`Leave approved for ${facultyName}`);
            fetchHODData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error approving leave');
        }
    };

    const handleRejectLeave = async (leaveId, facultyName) => {
        try {
            await api.put(`/leaves/${leaveId}/reject`, { remarks: 'Rejected by HOD' });
            toast.error(`Leave rejected for ${facultyName}`);
            fetchHODData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error rejecting leave');
        }
    };

    const handleCalendarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file');
            return;
        }

        const formData = new FormData();
        formData.append('calendarPdf', file);

        try {
            setUploadingCalendar(true);
            await api.post('/settings/calendar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Academic Calendar updated successfully');
        } catch (err) {
            console.error('Calendar upload error:', err);
            toast.error(err.response?.data?.message || 'Failed to upload calendar');
        } finally {
            setUploadingCalendar(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-28 bg-white border border-gray-100 rounded-3xl"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-white border border-gray-100 rounded-2xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-72 bg-white border border-gray-100 rounded-2xl"></div>
                    <div className="h-72 bg-white border border-gray-100 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8">
            {/* Elegant Premium Banner Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-8 text-white shadow-xl shadow-primary-950/10 border border-primary-800">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary-400/20 rounded-full blur-2xl opacity-40"></div>
                
                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wider text-accent-300 uppercase mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse"></span> HOD Portal Active
                        </span>
                        <h1 className="text-3xl font-extrabold tracking-tight font-heading mb-1">
                            HOD Dashboard — {user?.department}
                        </h1>
                        <p className="text-primary-100/90 text-sm font-medium">
                            Manage department operations, review leave queries, update syllabus, and control calendar.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        <button 
                            onClick={fetchHODData}
                            className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white transition backdrop-blur-md"
                            title="Reload Data"
                        >
                            <FiRefreshCw className="w-4 h-4" />
                        </button>
                        {myFacultyId && (
                            <Link to={`/faculty/${myFacultyId}`} className="bg-white text-primary px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 shadow-md transition-all">
                                Public Profile
                            </Link>
                        )}
                        <Link to="/hod/department-page" className="bg-accent text-slate-900 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-accent/90 shadow-md transition-all flex items-center gap-1.5">
                            Edit Dept Page
                        </Link>
                        <Link to="/hod/profile" className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition backdrop-blur-md">
                            Edit Profile
                        </Link>
                    </div>
                </div>
            </div>

            {/* Premium Stat Card Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 stagger-fade-in">
                <StatCard icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" label="Total Faculty" value={stats.totalFaculty} color="bg-indigo-600" />
                <StatCard icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" label="Pending Leaves" value={stats.pendingLeaves} color="bg-amber-500" />
                <StatCard icon="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" label="Active Notices" value={stats.circulars} color="bg-rose-500" />
                <StatCard icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" label="Total Research" value={stats.publications} color="bg-emerald-600" />
            </div>

            {/* Split Content Segment */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ═══════ PORTFOLIO & ACADEMIC MANAGEMENT ═══════ */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="w-1 h-5 bg-primary rounded-full"></span>
                            Faculty Portfolio Management
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Link to="/hod/qualifications" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-primary/5 rounded-2xl border border-slate-200/50 hover:border-primary/20 transition-all duration-300 group">
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary mb-3.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                    <FiBook className="w-5 h-5 text-primary" />
                                </div>
                                <span className="font-bold text-gray-800 text-sm">Qualifications</span>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Degrees & Licences</p>
                            </Link>

                            <Link to="/hod/publications" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-primary/5 rounded-2xl border border-slate-200/50 hover:border-primary/20 transition-all duration-300 group">
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary mb-3.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                    <FiTrendingUp className="w-5 h-5 text-accent" />
                                </div>
                                <span className="font-bold text-gray-800 text-sm">Publications</span>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Research Journals</p>
                            </Link>

                            <Link to="/hod/achievements" className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-primary/5 rounded-2xl border border-slate-200/50 hover:border-primary/20 transition-all duration-300 group">
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-primary mb-3.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                    <FiAward className="w-5 h-5 text-emerald-500" />
                                </div>
                                <span className="font-bold text-gray-800 text-sm">Achievements</span>
                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">Faculty Accolades</p>
                            </Link>
                        </div>
                    </section>
                </div>

                {/* ═══════ ACADEMIC CALENDAR UPLOAD ═══════ */}
                <div className="space-y-6">
                    <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col justify-between h-full relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
                        
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <FiCalendar className="text-accent" />
                                </div>
                                <h3 className="font-bold font-heading text-sm uppercase tracking-wider">Academic Calendar</h3>
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed mb-6">
                                Upload a PDF calendar specifying university exams, midterms, holidays, and college festivals.
                            </p>
                        </div>
                        
                        <div>
                            <label className={`w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 rounded-2xl cursor-pointer hover:border-accent/40 transition-all ${uploadingCalendar ? 'opacity-50 pointer-events-none' : ''}`}>
                                {uploadingCalendar ? (
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-2"></div>
                                ) : (
                                    <FiUploadCloud className="w-7 h-7 text-slate-400 mb-2 group-hover:text-accent transition-colors" />
                                )}
                                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">{uploadingCalendar ? 'Uploading...' : 'Choose PDF Document'}</span>
                                <input type="file" className="hidden" accept=".pdf" onChange={handleCalendarUpload} disabled={uploadingCalendar} />
                            </label>
                            <p className="text-[9px] text-slate-500 mt-3 text-center uppercase font-bold tracking-wider">Supported format: PDF only (Max 5MB)</p>
                        </div>
                    </section>
                </div>
            </div>

            {/* Split Grid for Faculty Profile Completions & Leaves */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Faculty Profiles Progress */}
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FiUsers className="text-primary" /> Faculty Registry Progress
                    </h2>
                    
                    <div className="space-y-5 stagger-fade-in max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                        {facultyList.length > 0 ? (
                            facultyList.map((faculty) => {
                                const completion = getProfileCompletion(faculty);
                                return (
                                    <div key={faculty._id} className="flex items-center space-x-3.5 bg-slate-50/55 p-3.5 rounded-2xl border border-slate-150/40">
                                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-black shadow-inner shrink-0">
                                            {faculty.name[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <p className="text-sm font-bold text-gray-800 truncate pr-2">{faculty.name}</p>
                                                <span className="text-xs font-black text-accent">{completion}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${
                                                        completion >= 90 ? 'bg-emerald-500' : completion >= 70 ? 'bg-accent' : 'bg-amber-500'
                                                    }`} 
                                                    style={{ width: `${completion}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-xs text-gray-400 font-medium py-6 text-center">No faculty member records exist yet.</p>
                        )}
                    </div>
                </div>

                {/* Recent Leaves Approvals */}
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FiBriefcase className="text-accent" /> Pending Leave Actions
                    </h2>
                    
                    <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                        {recentLeaves.length > 0 ? (
                            recentLeaves.map((leave) => (
                                <div key={leave._id} className="border border-gray-200/60 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors duration-300">
                                    <div className="flex items-start justify-between mb-3 gap-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">{leave.facultyName}</h4>
                                            <p className="text-[11px] text-gray-400 font-semibold mt-1">
                                                Reason: <span className="text-gray-600 font-bold">{leave.reason}</span>
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                                Starts: {new Date(leave.startDate).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary-200 px-3 py-1 rounded-full">{leave.leaveType}</span>
                                    </div>
                                    
                                    <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-100">
                                        <button 
                                            onClick={() => handleApproveLeave(leave._id, leave.facultyName)} 
                                            className="flex-1 inline-flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                                        >
                                            <FiCheck /> Approve
                                        </button>
                                        <button 
                                            onClick={() => handleRejectLeave(leave._id, leave.facultyName)} 
                                            className="flex-1 inline-flex items-center justify-center gap-1 bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                                        >
                                            <FiX /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                                <FiBriefcase className="w-8 h-8 text-gray-300 mb-2" />
                                <p className="text-xs font-bold text-gray-500">All caught up!</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">No pending staff leave applications to review.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HODDashboard;
