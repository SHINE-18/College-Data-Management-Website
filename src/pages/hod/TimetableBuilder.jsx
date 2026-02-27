import { useState } from 'react';
import toast from 'react-hot-toast';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '1:00-2:00', '2:00-3:00', '3:00-4:00'];
const subjects = ['', 'Data Structures', 'Algorithms', 'DBMS', 'OS', 'Networks', 'AI', 'ML', 'LUNCH'];
const facultyNames = ['', 'Dr. Sneha', 'Prof. Amit', 'Dr. Kavita', 'Prof. Deepak', 'Dr. Pooja'];

const TimetableBuilder = () => {
    const [grid, setGrid] = useState(() => {
        const g = {};
        days.forEach(d => { g[d] = {}; timeSlots.forEach(t => { g[d][t] = { subject: t === '12:00-1:00' ? 'LUNCH' : '', faculty: '' }; }); });
        return g;
    });

    const updateCell = (day, slot, field, value) => {
        setGrid(prev => ({ ...prev, [day]: { ...prev[day], [slot]: { ...prev[day][slot], [field]: value } } }));
    };

    // Clash detection: same faculty assigned at same time on same day
    const getClashes = () => {
        const clashes = new Set();
        timeSlots.forEach(slot => {
            const seen = {};
            days.forEach(day => {
                const fac = grid[day][slot].faculty;
                if (fac) {
                    if (seen[fac]) { clashes.add(`${seen[fac]}-${slot}`); clashes.add(`${day}-${slot}`); }
                    else seen[fac] = day;
                }
            });
        });
        return clashes;
    };

    const clashes = getClashes();

    const handleSave = () => {
        if (clashes.size > 0) { toast.error('Please resolve clashes before saving.'); return; }
        toast.success('Timetable saved successfully!');
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Timetable Builder</h1>
                    <p className="text-gray-500 text-sm mt-1">Build and manage the department timetable. Red cells indicate faculty clashes.</p>
                </div>
                <button onClick={handleSave} className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md">Save Timetable</button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-x-auto">
                <table className="w-full border-collapse min-w-[900px]">
                    <thead>
                        <tr>
                            <th className="bg-primary text-white px-3 py-2 text-xs font-semibold text-left rounded-tl-lg w-24">Day</th>
                            {timeSlots.map((slot, i) => (
                                <th key={slot} className={`bg-primary text-white px-2 py-2 text-xs font-semibold text-center ${i === timeSlots.length - 1 ? 'rounded-tr-lg' : ''}`}>{slot}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {days.map((day, di) => (
                            <tr key={day} className={di % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-3 py-2 text-xs font-semibold text-primary border-b border-gray-100">{day}</td>
                                {timeSlots.map(slot => {
                                    const isLunch = slot === '12:00-1:00';
                                    const hasClash = clashes.has(`${day}-${slot}`);
                                    return (
                                        <td key={slot} className={`px-1 py-1 border-b border-gray-100 ${hasClash ? 'bg-red-100' : ''} ${isLunch ? 'bg-yellow-50' : ''}`}>
                                            {isLunch ? (
                                                <div className="text-center text-xs text-yellow-600 font-medium py-2">LUNCH</div>
                                            ) : (
                                                <div className="space-y-1">
                                                    <select value={grid[day][slot].subject} onChange={e => updateCell(day, slot, 'subject', e.target.value)} className="w-full px-1 py-1 border border-gray-200 rounded text-[10px] bg-white focus:ring-1 focus:ring-accent outline-none">
                                                        {subjects.filter(s => s !== 'LUNCH').map(s => <option key={s} value={s}>{s || '— Subject —'}</option>)}
                                                    </select>
                                                    <select value={grid[day][slot].faculty} onChange={e => updateCell(day, slot, 'faculty', e.target.value)} className="w-full px-1 py-1 border border-gray-200 rounded text-[10px] bg-white focus:ring-1 focus:ring-accent outline-none">
                                                        {facultyNames.map(f => <option key={f} value={f}>{f || '— Faculty —'}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {clashes.size > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4 flex items-start space-x-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    <span>⚠️ Faculty clash detected! The same faculty is assigned to multiple classes at the same time slot. Red highlighted cells indicate clashes.</span>
                </div>
            )}
        </div>
    );
};

export default TimetableBuilder;
