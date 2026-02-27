const events = [
    { id: 1, title: 'National Conference on AI & Robotics', date: 'Mar 5-7, 2026', description: 'A two-day national conference featuring keynote speakers from top universities and industry leaders. Topics include deep learning, computer vision, and autonomous systems.', department: 'CSE', type: 'Conference' },
    { id: 2, title: 'Industry Connect — Campus Placement Drive', date: 'Mar 12, 2026', description: 'Major tech companies visiting campus for recruitment. Over 50 companies expected including TCS, Infosys, Wipro, Amazon, and Google.', department: 'Placement Cell', type: 'Placement' },
    { id: 3, title: 'Annual Sports Meet 2026', date: 'Mar 20-22, 2026', description: 'Inter-department sports competition featuring athletics, basketball, cricket, football, and indoor games. All students are encouraged to participate.', department: 'Sports Committee', type: 'Sports' },
    { id: 4, title: 'Workshop on IoT & Smart Cities', date: 'Mar 28, 2026', description: 'Hands-on workshop on Internet of Things applications in smart city infrastructure. Includes practical sessions with Arduino and Raspberry Pi.', department: 'ECE', type: 'Workshop' },
    { id: 5, title: 'Annual Cultural Fest — Euphoria 2026', date: 'Apr 2-4, 2026', description: 'Three-day cultural extravaganza with dance, music, dramatics, art exhibitions, and celebrity performances.', department: 'Cultural Committee', type: 'Cultural' },
    { id: 6, title: 'Hackathon — Code Rush 2026', date: 'Apr 15-16, 2026', description: '24-hour coding hackathon with themes including healthcare, education, and sustainability. Open to all departments. Cash prizes worth ₹1,00,000.', department: 'CSE', type: 'Competition' },
    { id: 7, title: 'Guest Lecture on Renewable Energy', date: 'Apr 20, 2026', description: 'Guest lecture by Dr. Raghav Menon, Chief Scientist at ISRO, on renewable energy technologies and their future in India.', department: 'EE', type: 'Lecture' },
    { id: 8, title: 'Alumni Homecoming 2026', date: 'May 1, 2026', description: 'Annual alumni meet for all batches. Networking, campus tour, achievements showcase, and gala dinner.', department: 'Alumni Cell', type: 'Cultural' },
];

const typeColors = {
    Conference: 'bg-blue-100 text-blue-700',
    Placement: 'bg-green-100 text-green-700',
    Sports: 'bg-orange-100 text-orange-700',
    Workshop: 'bg-purple-100 text-purple-700',
    Cultural: 'bg-pink-100 text-pink-700',
    Competition: 'bg-red-100 text-red-700',
    Lecture: 'bg-teal-100 text-teal-700',
};

const Events = () => (
    <div className="animate-fade-in">
        <div className="bg-gradient-to-r from-primary to-accent py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Events</h1>
                <p className="text-blue-100 max-w-2xl mx-auto">Explore upcoming events, workshops, guest lectures, and activities.</p>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                    <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                        <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                            <svg className="w-16 h-16 text-primary/20 group-hover:text-primary/40 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[event.type] || 'bg-gray-100 text-gray-700'}`}>{event.type}</span>
                                <span className="text-xs bg-primary/5 text-primary font-medium px-2.5 py-1 rounded-full">{event.department}</span>
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary transition">{event.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-3">{event.description}</p>
                            <div className="flex items-center space-x-2 text-sm text-accent font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>{event.date}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default Events;
