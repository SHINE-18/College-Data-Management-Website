import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { FaCheck, FaTimes, FaSave, FaUndo } from 'react-icons/fa';

const AttendanceManager = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Filtering states
    const [semester, setSemester] = useState('1');
    const [subject, setSubject] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Attendance map { studentId: 'Present' | 'Absent' }
    const [attendanceMap, setAttendanceMap] = useState({});
    const [originalAttendanceMap, setOriginalAttendanceMap] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Calculate stats
    const stats = {
        total: students.length,
        present: students.filter(s => attendanceMap[s._id] === 'Present').length,
        absent: students.filter(s => attendanceMap[s._id] === 'Absent').length
    };

    // Fetch students
    const handleFetchStudents = async () => {
        if (!subject) {
            toast.error('Please enter a subject name first');
            return;
        }
        setLoading(true);
        try {
            const response = await api.get(`/faculty/portal/students?semester=${semester}`);
            setStudents(response.data);

            // Initialize map with default Present
            const initialMap = {};
            response.data.forEach(st => { initialMap[st._id] = 'Present'; });
            setAttendanceMap(initialMap);
            setOriginalAttendanceMap(JSON.parse(JSON.stringify(initialMap)));

            if (response.data.length === 0) toast.error('No students found for this semester');
        } catch (error) {
            console.error("Fetch students error", error);
            toast.error('Failed to load students. Ensure backend route exists.');
        } finally {
            setLoading(false);
        }
    };

    // Toggle attendance with one click
    const toggleAttendance = (studentId) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'p' || e.key === 'P') markAllPresent();
            if (e.key === 'a' || e.key === 'A') markAllAbsent();
            if (e.key === 'r' || e.key === 'R') handleReset();
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [students]);

    const markAllPresent = () => {
        const map = {};
        students.forEach(s => map[s._id] = 'Present');
        setAttendanceMap(map);
        toast.success('✓ All marked as Present');
    };

    const markAllAbsent = () => {
        const map = {};
        students.forEach(s => map[s._id] = 'Absent');
        setAttendanceMap(map);
        toast.success('✕ All marked as Absent');
    };

    const handleReset = () => {
        setAttendanceMap(JSON.parse(JSON.stringify(originalAttendanceMap)));
        toast.success('Reset to previous state');
    };

    const hasChanges = JSON.stringify(attendanceMap) !== JSON.stringify(originalAttendanceMap);    ;

    const handleSaveAttendance = async () => {
        if (students.length === 0) return toast.error('No students to save');

        setSaving(true);
        try {
            const records = students.map(st => ({
                student: st._id,
                subject,
                date,
                status: attendanceMap[st._id],
                semester: Number(semester)
            }));

            await api.post('/faculty/portal/attendance', { records });
            setOriginalAttendanceMap(JSON.parse(JSON.stringify(attendanceMap)));
            setShowConfirmModal(false);
            toast.success('✓ Attendance saved successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save attendance');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 p-4 md:p-8">
            <div className="space-y-4">
                {/* Header */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">📋 Mark Attendance</h1>
                    <p className="text-gray-600 text-sm mt-1">Quick and easy attendance marking system</p>
                </div>

                {/* Setup Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Semester</label>
                            <select value={semester} onChange={e => setSemester(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Subject</label>
                            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Data Structures" className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition" />
                        </div>
                        <button onClick={handleFetchStudents} disabled={loading} className="w-full bg-primary hover:bg-primary-700 disabled:bg-gray-300 text-white py-3 rounded-xl transition font-bold text-base shadow-lg hover:shadow-xl disabled:shadow-none">
                            {loading ? '⏳ Loading...' : '📥 Load Students'}
                        </button>
                    </div>
                </div>

                {/* Quick Stats & Actions */}
                {students.length > 0 && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
                            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 text-center">
                                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                                <div className="text-xs text-gray-600 font-semibold mt-1">Total Students</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-300 p-4 text-center">
                                <div className="text-3xl font-bold text-green-700">{stats.present}</div>
                                <div className="text-xs text-green-700 font-semibold mt-1">✓ Present</div>
                            </div>
                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-300 p-4 text-center">
                                <div className="text-3xl font-bold text-red-700">{stats.absent}</div>
                                <div className="text-xs text-red-700 font-semibold mt-1">✕ Absent</div>
                            </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex gap-3 flex-wrap">
                            <button onClick={markAllPresent} className="flex-1 min-w-[150px] bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                                <FaCheck size={18} /> Mark All Present (P)
                            </button>
                            <button onClick={markAllAbsent} className="flex-1 min-w-[150px] bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                                <FaTimes size={18} /> Mark All Absent (A)
                            </button>
                            <button onClick={handleReset} disabled={!hasChanges} className="px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 rounded-xl font-bold transition flex items-center gap-2">
                                <FaUndo size={16} /> Reset (R)
                            </button>
                        </div>

                        {/* Student List - Simplified */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-gray-200">
                                <span className="font-bold text-gray-900 text-lg">👥 Class List • {students.length} Students</span>
                            </div>
                            <div className="divide-y divide-gray-100 max-h-[65vh] overflow-y-auto">
                                {students.map(student => (
                                    <button
                                        key={student._id}
                                        onClick={() => toggleAttendance(student._id)}
                                        className={`w-full p-4 flex items-center justify-between transition-all duration-200 hover:bg-gray-50 group ${
                                            attendanceMap[student._id] === 'Present'
                                                ? 'bg-green-50 hover:bg-green-100'
                                                : 'bg-red-50 hover:bg-red-100'
                                        }`}
                                    >
                                        <div className="text-left flex-1">
                                            <div className="font-bold text-gray-900 text-base">{student.name}</div>
                                            <div className="text-xs text-gray-500 font-semibold">{student.enrollmentNumber}</div>
                                        </div>
                                        <div className={`flex items-center justify-center w-16 h-16 rounded-xl font-bold text-xl transition-all ${
                                            attendanceMap[student._id] === 'Present'
                                                ? 'bg-green-500 text-white shadow-lg scale-105'
                                                : 'bg-red-500 text-white shadow-lg scale-105'
                                        }`}>
                                            {attendanceMap[student._id] === 'Present' ? <FaCheck size={24} /> : <FaTimes size={24} />}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                                <div className="text-sm font-semibold text-gray-700">
                                    {hasChanges && <span className="text-orange-600">● Unsaved Changes</span>}
                                </div>
                                <button 
                                    onClick={() => setShowConfirmModal(true)} 
                                    disabled={!hasChanges || saving} 
                                    className="bg-primary hover:bg-primary-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg hover:shadow-xl flex items-center gap-2 text-base"
                                >
                                    <FaSave /> {saving ? 'Saving...' : 'Save Attendance'}
                                </button>
                            </div>
                        </div>
                    </>
                )}

                {/* Confirmation Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Confirm & Save</h3>
                            <p className="text-gray-600 mb-6">Saving attendance for {students.length} students</p>
                            <div className="space-y-2 mb-6 p-4 bg-gray-50 rounded-xl">
                                <div className="flex justify-between items-center text-base font-semibold">
                                    <span className="text-gray-700">✓ Present:</span>
                                    <span className="text-green-700 text-xl">{stats.present}</span>
                                </div>
                                <div className="flex justify-between items-center text-base font-semibold">
                                    <span className="text-gray-700">✕ Absent:</span>
                                    <span className="text-red-700 text-xl">{stats.absent}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowConfirmModal(false)} 
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-bold text-base"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveAttendance} 
                                    disabled={saving} 
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary-700 disabled:bg-gray-300 text-white rounded-xl transition font-bold text-base flex items-center justify-center gap-2"
                                >
                                    <FaSave /> {saving ? 'Saving...' : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendanceManager;
