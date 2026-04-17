import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import StatCard from '../../components/StatCard';
import toast from 'react-hot-toast';

const HODDashboard = () => {
    const { user } = useAuth();
    const [facultyList, setFacultyList] = useState([]);
    const [recentLeaves, setRecentLeaves] = useState([]);
    const [stats, setStats] = useState({ totalFaculty: 0, pendingLeaves: 0, circulars: 0, publications: 0 });
    const [loading, setLoading] = useState(true);
    const [uploadingCalendar, setUploadingCalendar] = useState(false);
    const [myFacultyId, setMyFacultyId] = useState(null);

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

    if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading department dashboard...</div>;

    return (
        <div className="animate-fade-in space-y-6 md:space-y-8">
            <div className="bg-gradient-to-r from-primary-700 to-primary rounded-xl md:rounded-2xl p-4 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold">HOD Dashboard - {user?.department} Department</h1>
                    <p className="text-primary-100 mt-1 text-sm">Manage your department, faculty, and academic operations.</p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                    {myFacultyId && (
                        <Link to={`/faculty/${myFacultyId}`} className="bg-white text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-100 transition shadow-sm border border-white">
                            View Public Profile
                        </Link>
                    )}
                    <Link to="/hod/profile" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-semibold transition backdrop-blur-sm border border-white/20">
                        Edit My Profile
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" label="Total Faculty" value={stats.totalFaculty} color="bg-indigo-600" />
                <StatCard icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" label="Pending Leaves" value={stats.pendingLeaves} color="bg-amber-500" />
                <StatCard icon="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" label="Active Notices" value={stats.circulars} color="bg-rose-500" />
                <StatCard icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" label="Total Publications" value={stats.publications} color="bg-emerald-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ═══════ PORTFOLIO & ACADEMIC MANAGEMENT ═══════ */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                            <span className="w-1.5 h-6 bg-primary rounded-full mr-3"></span>
                            Academic Portfolio Management
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Link to="/hod/qualifications" className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition group">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                                </div>
                                <span className="font-bold text-slate-700">Qualifications</span>
                                <p className="text-[10px] text-slate-400 mt-1">Degrees & Certifications</p>
                            </Link>

                            <Link to="/hod/publications" className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition group">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                                </div>
                                <span className="font-bold text-slate-700">Publications</span>
                                <p className="text-[10px] text-slate-400 mt-1">Journals & Research</p>
                            </Link>

                            <Link to="/hod/achievements" className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition group">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                </div>
                                <span className="font-bold text-slate-700">Achievements</span>
                                <p className="text-[10px] text-slate-400 mt-1">Awards & Recognition</p>
                            </Link>
                        </div>
                    </section>
                </div>

                {/* ═══════ ACADEMIC CALENDAR UPLOAD ═══════ */}
                <div className="space-y-6">
                    <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <h3 className="font-bold">Academic Calendar</h3>
                        </div>
                        <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                            Upload the latest institutional academic calendar. This will be visible to all students and faculty across the portal.
                        </p>
                        
                        <label className={`w-full flex flex-col items-center justify-center px-4 py-8 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:border-accent/50 hover:bg-white/5 transition-all ${uploadingCalendar ? 'opacity-50 pointer-events-none' : ''}`}>
                            {uploadingCalendar ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mb-2"></div>
                            ) : (
                                <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                            )}
                            <span className="text-xs font-bold">{uploadingCalendar ? 'Uploading...' : 'Choose PDF File'}</span>
                            <input type="file" className="hidden" accept=".pdf" onChange={handleCalendarUpload} disabled={uploadingCalendar} />
                        </label>
                        <p className="text-[10px] text-slate-500 mt-4 text-center">Supported format: PDF only (Max 5MB)</p>
                    </section>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Faculty Profile Completion</h2>
                    <div className="space-y-4">
                        {facultyList.length > 0 ? (
                            facultyList.map((faculty) => {
                                const completion = getProfileCompletion(faculty);
                                return (
                                    <div key={faculty._id} className="flex items-center space-x-3">
                                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-xs font-bold">{faculty.name[0]}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">{faculty.name}</p>
                                                <span className="text-xs font-semibold text-accent">{completion}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div className={`h-1.5 rounded-full ${completion >= 90 ? 'bg-green-500' : completion >= 70 ? 'bg-accent' : 'bg-yellow-500'}`} style={{ width: `${completion}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-500">No faculty data available</p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Leave Requests</h2>
                    <div className="space-y-4">
                        {recentLeaves.length > 0 ? (
                            recentLeaves.map((leave) => (
                                <div key={leave._id} className="border border-gray-100 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition">
                                    <div className="flex items-start justify-between mb-2 gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{leave.facultyName}</p>
                                            <p className="text-xs text-gray-500">{leave.reason} - {new Date(leave.startDate).toLocaleDateString()}</p>
                                        </div>
                                        <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{leave.leaveType}</span>
                                    </div>
                                    <div className="flex space-x-2 mt-3">
                                        <button onClick={() => handleApproveLeave(leave._id, leave.facultyName)} className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600 transition">Approve</button>
                                        <button onClick={() => handleRejectLeave(leave._id, leave.facultyName)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition">Reject</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No pending leave requests</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HODDashboard;
