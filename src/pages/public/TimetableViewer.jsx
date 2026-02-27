import { useState } from 'react';
import toast from 'react-hot-toast';
import TimetableGrid from '../../components/TimetableGrid';

const timetableData = {
    CSE: {
        1: {
            Monday: { '9:00-10:00': { subject: 'Maths I', faculty: 'Dr. Sharma' }, '10:00-11:00': { subject: 'Physics', faculty: 'Prof. Singh' }, '11:00-12:00': { subject: 'C Programming', faculty: 'Prof. Joshi' }, '2:00-3:00': { subject: 'Workshop', faculty: 'Mr. Rao' }, '3:00-4:00': { subject: 'English', faculty: 'Ms. Priya' } },
            Tuesday: { '9:00-10:00': { subject: 'Physics Lab', faculty: 'Prof. Singh' }, '10:00-11:00': { subject: 'Physics Lab', faculty: 'Prof. Singh' }, '11:00-12:00': { subject: 'Maths I', faculty: 'Dr. Sharma' }, '2:00-3:00': { subject: 'Electronics', faculty: 'Dr. Nair' }, '3:00-4:00': { subject: 'C Programming', faculty: 'Prof. Joshi' } },
            Wednesday: { '9:00-10:00': { subject: 'English', faculty: 'Ms. Priya' }, '10:00-11:00': { subject: 'Electronics', faculty: 'Dr. Nair' }, '11:00-12:00': { subject: 'Maths I', faculty: 'Dr. Sharma' }, '2:00-3:00': { subject: 'C Lab', faculty: 'Prof. Joshi' }, '3:00-4:00': { subject: 'C Lab', faculty: 'Prof. Joshi' } },
            Thursday: { '9:00-10:00': { subject: 'Physics', faculty: 'Prof. Singh' }, '10:00-11:00': { subject: 'C Programming', faculty: 'Prof. Joshi' }, '11:00-12:00': { subject: 'English', faculty: 'Ms. Priya' }, '2:00-3:00': { subject: 'Maths I', faculty: 'Dr. Sharma' }, '3:00-4:00': { subject: 'Workshop', faculty: 'Mr. Rao' } },
            Friday: { '9:00-10:00': { subject: 'Electronics', faculty: 'Dr. Nair' }, '10:00-11:00': { subject: 'Maths I', faculty: 'Dr. Sharma' }, '11:00-12:00': { subject: 'Physics', faculty: 'Prof. Singh' }, '2:00-3:00': { subject: 'English', faculty: 'Ms. Priya' }, '3:00-4:00': { subject: 'C Programming', faculty: 'Prof. Joshi' } },
            Saturday: { '9:00-10:00': { subject: 'Workshop', faculty: 'Mr. Rao' }, '10:00-11:00': { subject: 'Workshop', faculty: 'Mr. Rao' }, '11:00-12:00': { subject: 'Library', faculty: '—' } },
        },
    },
};

const departments = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT'];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

const TimetableViewer = () => {
    const [dept, setDept] = useState('CSE');
    const [sem, setSem] = useState(1);
    const tt = timetableData[dept]?.[sem] || {};

    return (
        <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-primary to-accent py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Timetable</h1>
                    <p className="text-blue-100 max-w-2xl mx-auto">View class schedules for any department and semester.</p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select id="tt-dept" value={dept} onChange={e => setDept(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white">{departments.map(d => <option key={d} value={d}>{d}</option>)}</select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <select id="tt-sem" value={sem} onChange={e => setSem(Number(e.target.value))} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white">{semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}</select>
                    </div>
                    <button onClick={() => toast.success('PDF download will be available when connected to backend.')} className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition shadow-md whitespace-nowrap">
                        Download PDF
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-hidden">
                    <TimetableGrid timetable={tt} />
                    {Object.keys(tt).length === 0 && <div className="text-center py-12 text-gray-400"><p>No timetable available for this selection. Only CSE Sem 1 has demo data.</p></div>}
                </div>
            </div>
        </div>
    );
};

export default TimetableViewer;
