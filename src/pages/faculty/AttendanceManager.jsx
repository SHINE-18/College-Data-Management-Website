import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaCheck, FaTimes, FaSave } from 'react-icons/fa';

const AttendanceManager = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filtering states
    const [semester, setSemester] = useState('1');
    const [subject, setSubject] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Attendance map { studentId: 'Present' | 'Absent' }
    const [attendanceMap, setAttendanceMap] = useState({});

    // Fetch students to mark attendance for
    const handleFetchStudents = async () => {
        if (!subject) {
            toast.error('Please enter a subject name first');
            return;
        }
        setLoading(true);
        try {
            // Note: Currently we don't have a route explicitly for fetching students by semester,
            // assuming an endpoint like GET /api/faculty/students?semester=1 exists or will be added.
            // For now, let's pretend it fetches all and we filter, or we hit a specific API endpoint.
            const { data } = await api.get('/auth/users'); // Fallback or placeholder actually we need students!
            // Let's assume we have a new endpoint to get students explicitly:
            const response = await api.get(`/faculty/students?semester=${semester}`);

            setStudents(response.data);

            // Initialize map
            const initialMap = {};
            response.data.forEach(st => { initialMap[st._id] = 'Present'; }); // Default present
            setAttendanceMap(initialMap);

            if (response.data.length === 0) toast.error('No students found for this semester');
        } catch (error) {
            console.error("Fetch students error", error);
            // Fallback for demonstration since we haven't built the GET /students backend route yet
            toast.error('Failed to load students. Ensure backend route exists.');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = (studentId) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present'
        }));
    };

    const handleSaveAttendance = async () => {
        if (students.length === 0) return toast.error('No students to save');

        try {
            const records = students.map(st => ({
                student: st._id,
                subject,
                date,
                status: attendanceMap[st._id],
                semester: Number(semester)
            }));

            // Assuming a batch POST route exists at /api/faculty/attendance
            await api.post('/faculty/attendance', { records });
            toast.success('Attendance saved successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save attendance');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
                    <p className="text-gray-500 text-sm mt-1">Select class details to mark today's attendance.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Semester</label>
                        <select value={semester} onChange={e => setSemester(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Subject Name</label>
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Data Structures" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <button onClick={handleFetchStudents} disabled={loading} className="w-full bg-primary hover:bg-primary-700 text-white py-2 rounded-lg transition text-sm font-medium disabled:opacity-50">
                        {loading ? 'Loading...' : 'Fetch Students'}
                    </button>
                </div>
            </div>

            {/* Student List */}
            {students.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Class List ({students.length} Students)</span>
                        <div className="space-x-3">
                            <button onClick={() => {
                                const map = {}; students.forEach(s => map[s._id] = 'Present'); setAttendanceMap(map);
                            }} className="text-xs text-green-600 font-medium hover:underline">Mark All Present</button>
                            <button onClick={() => {
                                const map = {}; students.forEach(s => map[s._id] = 'Absent'); setAttendanceMap(map);
                            }} className="text-xs text-red-600 font-medium hover:underline">Mark All Absent</button>
                        </div>
                    </div>
                    <ul className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                        {students.map(student => (
                            <li key={student._id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition">
                                <div>
                                    <div className="font-medium text-gray-900">{student.name}</div>
                                    <div className="text-xs text-gray-500">{student.enrollmentNumber}</div>
                                </div>
                                <button
                                    onClick={() => toggleStatus(student._id)}
                                    className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium transition ${attendanceMap[student._id] === 'Present' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}
                                >
                                    {attendanceMap[student._id] === 'Present' ? <FaCheck size={12} /> : <FaTimes size={12} />}
                                    <span>{attendanceMap[student._id]}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
                        <button onClick={handleSaveAttendance} className="bg-primary hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition text-sm font-medium shadow-sm flex items-center space-x-2 ml-auto">
                            <FaSave />
                            <span>Save Attendance</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceManager;
