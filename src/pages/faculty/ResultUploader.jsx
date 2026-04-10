import { useState } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const ResultUploader = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form Config
    const [semester, setSemester] = useState('1');
    const [subject, setSubject] = useState('');
    const [examType, setExamType] = useState('Mid-Sem');
    const [totalMarks, setTotalMarks] = useState('30');

    // Marks map { studentId: { marksObtained: '', remarks: '' } }
    const [marksMap, setMarksMap] = useState({});

    const handleFetchStudents = async () => {
        if (!subject || !totalMarks) {
            toast.error('Subject Name and Total Marks are required');
            return;
        }
        setLoading(true);
        try {
            // Placeholder: Assume new student fetch endpoint
            const { data } = await api.get('/auth/users'); // we need a real /students endpoint here
            const response = await api.get(`/faculty/portal/students?semester=${semester}`);

            setStudents(response.data);

            const initialMap = {};
            response.data.forEach(st => {
                initialMap[st._id] = { marksObtained: '', remarks: '' };
            });
            setMarksMap(initialMap);

            if (response.data.length === 0) toast.error('No students found for this semester');
        } catch (error) {
            console.error("Fetch students error", error);
            toast.error('Failed to load students list.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkChange = (studentId, field, value) => {
        setMarksMap(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const handleSaveResults = async () => {
        if (students.length === 0) return toast.error('No students to save');

        try {
            const records = students
                .filter(st => marksMap[st._id].marksObtained !== '') // Only submit entered marks
                .map(st => ({
                    student: st._id,
                    subject,
                    examType,
                    semester: Number(semester),
                    marksObtained: Number(marksMap[st._id].marksObtained),
                    totalMarks: Number(totalMarks),
                    remarks: marksMap[st._id].remarks
                }));

            if (records.length === 0) {
                return toast.error('No marks entered to save');
            }

            // Mock endpoint for submitting batch results
            await api.post('/faculty/portal/results', { records });
            toast.success(`${records.length} results saved successfully!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save results');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900">Upload Exam Results</h1>

            {/* config */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Semester</label>
                        <select value={semester} onChange={e => setSemester(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-accent outline-none">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <option key={sem} value={sem}>Sem {sem}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Exam Type</label>
                        <select value={examType} onChange={e => setExamType(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-accent outline-none">
                            {['Mid-Sem', 'Final', 'Practical', 'Internal', 'Viva'].map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-accent outline-none" placeholder="Target Subject" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Total Marks</label>
                        <input type="number" min="1" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-accent outline-none" />
                    </div>
                    <button onClick={handleFetchStudents} disabled={loading} className="w-full bg-accent hover:bg-accent-600 text-white py-2 rounded-lg transition text-sm font-medium">
                        Fetch Class
                    </button>
                </div>
            </div>

            {/* List */}
            {students.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                                <th className="p-4 font-medium">Student Name</th>
                                <th className="p-4 font-medium">Enrollment No.</th>
                                <th className="p-4 font-medium w-32">Marks Obtained</th>
                                <th className="p-4 font-medium">Remarks (Optional)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map(student => (
                                <tr key={student._id} className="hover:bg-blue-50/30 transition">
                                    <td className="p-4 font-medium text-gray-900 text-sm">{student.name}</td>
                                    <td className="p-4 text-gray-500 text-sm">{student.enrollmentNumber}</td>
                                    <td className="p-4">
                                        <input
                                            type="number"
                                            min="0"
                                            max={totalMarks}
                                            value={marksMap[student._id].marksObtained}
                                            onChange={(e) => handleMarkChange(student._id, 'marksObtained', e.target.value)}
                                            className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-accent outline-none text-sm text-center"
                                            placeholder={`/${totalMarks}`}
                                        />
                                    </td>
                                    <td className="p-4">
                                        <input
                                            type="text"
                                            value={marksMap[student._id].remarks}
                                            onChange={(e) => handleMarkChange(student._id, 'remarks', e.target.value)}
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-accent outline-none text-sm bg-gray-50"
                                            placeholder="e.g. absent, outstanding..."
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-right">
                        <button onClick={handleSaveResults} className="bg-primary hover:bg-primary-700 text-white px-8 py-2.5 rounded-lg transition text-sm font-medium shadow-lg hover:shadow-xl">
                            Publish Results
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultUploader;
