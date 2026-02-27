const TimetableGrid = ({ timetable }) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '1:00-2:00', '2:00-3:00', '3:00-4:00'];

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="bg-primary text-white px-4 py-3 text-sm font-semibold text-left rounded-tl-lg">Day / Time</th>
                        {timeSlots.map(slot => (
                            <th key={slot} className="bg-primary text-white px-3 py-3 text-xs font-semibold text-center last:rounded-tr-lg">{slot}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {days.map((day, dayIdx) => (
                        <tr key={day} className={dayIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-3 text-sm font-semibold text-primary border-b border-gray-100">{day}</td>
                            {timeSlots.map((slot, slotIdx) => {
                                const cell = timetable?.[day]?.[slot];
                                const isLunch = slot === '12:00-1:00';
                                return (
                                    <td key={slot} className={`px-2 py-2 text-center border-b border-gray-100 ${isLunch ? 'bg-yellow-50' : ''}`}>
                                        {isLunch ? (
                                            <span className="text-xs text-yellow-600 font-medium">LUNCH</span>
                                        ) : cell ? (
                                            <div className="bg-accent/10 rounded-lg p-2 hover:bg-accent/20 transition">
                                                <p className="text-xs font-semibold text-primary">{cell.subject}</p>
                                                <p className="text-[10px] text-gray-500">{cell.faculty}</p>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-300">—</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TimetableGrid;
