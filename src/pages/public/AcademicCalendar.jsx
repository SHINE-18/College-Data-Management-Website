import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { FaDownload, FaCalendarAlt } from 'react-icons/fa';

const calendar = [
    { event: 'Even Semester Begins', date: 'Jan 6, 2026', type: 'academic', color: 'bg-blue-100 text-blue-700' },
    { event: 'Republic Day', date: 'Jan 26, 2026', type: 'holiday', color: 'bg-red-100 text-red-700' },
    { event: 'Internal Assessment I', date: 'Feb 10-15, 2026', type: 'exam', color: 'bg-yellow-100 text-yellow-700' },
    { event: 'Maha Shivaratri', date: 'Feb 26, 2026', type: 'holiday', color: 'bg-red-100 text-red-700' },
    { event: 'Annual Cultural Fest', date: 'Mar 15-17, 2026', type: 'event', color: 'bg-purple-100 text-purple-700' },
    { event: 'Holi', date: 'Mar 17, 2026', type: 'holiday', color: 'bg-red-100 text-red-700' },
    { event: 'Internal Assessment II', date: 'Mar 25-30, 2026', type: 'exam', color: 'bg-yellow-100 text-yellow-700' },
    { event: 'Good Friday', date: 'Apr 3, 2026', type: 'holiday', color: 'bg-red-100 text-red-700' },
    { event: 'Lab Examinations', date: 'Apr 15-25, 2026', type: 'exam', color: 'bg-yellow-100 text-yellow-700' },
    { event: 'End Semester Examinations', date: 'May 1-15, 2026', type: 'exam', color: 'bg-yellow-100 text-yellow-700' },
    { event: 'Summer Vacation', date: 'May 16 - Jun 30, 2026', type: 'holiday', color: 'bg-green-100 text-green-700' },
    { event: 'Odd Semester Begins', date: 'Jul 1, 2026', type: 'academic', color: 'bg-blue-100 text-blue-700' },
    { event: 'Independence Day', date: 'Aug 15, 2026', type: 'holiday', color: 'bg-red-100 text-red-700' },
    { event: 'Internal Assessment III', date: 'Aug 20-25, 2026', type: 'exam', color: 'bg-yellow-100 text-yellow-700' },
    { event: 'Gandhi Jayanti', date: 'Oct 2, 2026', type: 'holiday', color: 'bg-red-100 text-red-700' },
    { event: 'Dussehra', date: 'Oct 12, 2026', type: 'holiday', color: 'bg-red-100 text-red-700' },
    { event: 'Diwali Vacation', date: 'Oct 28 - Nov 3, 2026', type: 'holiday', color: 'bg-red-100 text-red-700' },
    { event: 'Internal Assessment IV', date: 'Nov 10-15, 2026', type: 'exam', color: 'bg-yellow-100 text-yellow-700' },
    { event: 'Odd Semester Examinations', date: 'Dec 1-15, 2026', type: 'exam', color: 'bg-yellow-100 text-yellow-700' },
    { event: 'Winter Vacation', date: 'Dec 16-31, 2026', type: 'holiday', color: 'bg-green-100 text-green-700' },
];

const legendItems = [
    { label: 'Academic', color: 'bg-blue-400' },
    { label: 'Holiday', color: 'bg-red-400' },
    { label: 'Examination', color: 'bg-yellow-400' },
    { label: 'Event', color: 'bg-purple-400' },
    { label: 'Vacation', color: 'bg-green-400' },
];

const AcademicCalendar = () => {
    const [calendarUrl, setCalendarUrl] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                if (data.academicCalendarPdf) {
                    setCalendarUrl(data.academicCalendarPdf);
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-primary-700 to-primary py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4 font-heading">Academic Calendar 2026</h1>
                    <p className="text-primary-100 max-w-2xl mx-auto opacity-90">Complete schedule of academic activities, examinations, holidays, and events.</p>

                    {calendarUrl && (
                        <div className="mt-8">
                            <a
                                href={calendarUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-3 bg-white text-primary px-8 py-4 rounded-2xl font-bold shadow-2xl hover:bg-primary-50 transition-all transform hover:-translate-y-1 active:scale-95 border-2 border-white/20"
                            >
                                <FaDownload className="animate-bounce" />
                                <span>Download Official PDF Calendar</span>
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mb-10 justify-center">
                    {legendItems.map(item => (
                        <div key={item.label} className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                            <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                            <span className="text-xs font-bold text-gray-600 tracking-wide uppercase">{item.label}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-20">#</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Event Description</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Target Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calendar.map((item, i) => (
                                    <tr key={i} className="group hover:bg-primary/5 transition-colors border-b last:border-0 border-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-400">{String(i + 1).padStart(2, '0')}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.event}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{item.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${item.color} shadow-sm border border-black/5`}>
                                                {item.type}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-start space-x-4">
                    <FaCalendarAlt className="text-blue-500 mt-1" />
                    <p className="text-sm text-blue-800 leading-relaxed font-medium">
                        <strong>Note:</strong> The above dates are tentative and subject to change based on GTU guidelines and college administrative decisions. For the most accurate information, please refer to the official signed PDF calendar linked above.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AcademicCalendar;
