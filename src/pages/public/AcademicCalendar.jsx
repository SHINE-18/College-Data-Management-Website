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

const AcademicCalendar = () => (
    <div className="animate-fade-in">
        <div className="bg-gradient-to-r from-primary to-accent py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Academic Calendar 2026</h1>
                <p className="text-blue-100 max-w-2xl mx-auto">Complete schedule of academic activities, examinations, holidays, and events.</p>
            </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center">
                {legendItems.map(item => (
                    <div key={item.label} className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                        <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-primary text-white">
                            <th className="text-left px-6 py-3 text-sm font-semibold w-20">#</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold">Event</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold">Date</th>
                            <th className="text-left px-6 py-3 text-sm font-semibold">Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {calendar.map((item, i) => (
                            <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                <td className="px-6 py-3 text-sm text-gray-400">{i + 1}</td>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.event}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{item.date}</td>
                                <td className="px-6 py-3">
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${item.color}`}>
                                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export default AcademicCalendar;
