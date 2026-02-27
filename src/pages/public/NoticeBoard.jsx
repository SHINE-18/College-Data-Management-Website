import { useState } from 'react';
import NoticeCard from '../../components/NoticeCard';

const allNotices = [
    { id: 1, title: 'Mid-Semester Examination Schedule Released', category: 'Exam', date: 'Feb 20, 2026', content: 'The mid-semester examination schedule for all departments has been published. Students are requested to check and download.', postedBy: 'Examination Cell', attachment: true, department: 'All' },
    { id: 2, title: 'New Admission Guidelines 2026-27', category: 'Admission', date: 'Feb 18, 2026', content: 'Applications are invited for admission to UG and PG programs for 2026-27. Eligible candidates can apply through the online portal.', postedBy: 'Admission Office', attachment: true, department: 'All' },
    { id: 3, title: 'Annual Cultural Fest — Euphoria 2026', category: 'Events', date: 'Feb 15, 2026', content: 'Annual cultural festival scheduled from March 15-17. All students are encouraged to participate.', postedBy: 'Cultural Committee', attachment: false, department: 'All' },
    { id: 4, title: 'Holiday Notice — Republic Day', category: 'General', date: 'Feb 12, 2026', content: 'The college will remain closed on January 26 on the occasion of Republic Day.', postedBy: 'Principal Office', attachment: false, department: 'All' },
    { id: 5, title: 'Workshop on Machine Learning', category: 'Events', date: 'Feb 10, 2026', content: '3-day workshop on ML and AI conducted by CSE department in collaboration with IIT Bombay.', postedBy: 'CSE Department', attachment: true, department: 'CSE' },
    { id: 6, title: 'Lab Examination Time Table — Even Semester', category: 'Exam', date: 'Feb 8, 2026', content: 'Lab examination timetable for even semester has been published for all departments.', postedBy: 'Examination Cell', attachment: true, department: 'All' },
    { id: 7, title: 'Industry Visit — Bosch Electronics', category: 'Events', date: 'Feb 5, 2026', content: 'ECE department is organizing an industry visit to Bosch Electronics on March 10, 2026.', postedBy: 'ECE Department', attachment: false, department: 'ECE' },
    { id: 8, title: 'Scholarship Application Deadline Extended', category: 'Admission', date: 'Feb 3, 2026', content: 'The deadline for merit scholarship applications has been extended to March 15, 2026.', postedBy: 'Scholarship Cell', attachment: true, department: 'All' },
    { id: 9, title: 'Library Timing Change During Exams', category: 'General', date: 'Jan 30, 2026', content: 'Library will remain open from 8 AM to 10 PM during the examination period.', postedBy: 'Library', attachment: false, department: 'All' },
    { id: 10, title: 'Guest Lecture on IoT and Edge Computing', category: 'Events', date: 'Jan 28, 2026', content: 'A guest lecture by Dr. Pankaj Sharma, Distinguished Engineer at Intel, on IoT and Edge Computing.', postedBy: 'IT Department', attachment: false, department: 'IT' },
    { id: 11, title: 'Convocation 2025 — Photo Gallery', category: 'General', date: 'Jan 25, 2026', content: 'Photos from the 2025 Convocation Ceremony are now available on the college website.', postedBy: 'Media Cell', attachment: true, department: 'All' },
    { id: 12, title: 'Coding Competition — Code Sprint 2026', category: 'Events', date: 'Jan 22, 2026', content: 'Inter-department coding competition. Register by Feb 15. Top 3 winners get cash prizes.', postedBy: 'CSE Department', attachment: false, department: 'CSE' },
];

const categories = ['All', 'General', 'Exam', 'Admission', 'Events'];
const departments = ['All', 'CSE', 'ECE', 'ME', 'CE', 'EE', 'IT'];

const NoticeBoard = () => {
    const [tab, setTab] = useState('All');
    const [dept, setDept] = useState('All');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 6;

    const filtered = allNotices.filter(n => {
        const matchCat = tab === 'All' || n.category === tab;
        const matchDept = dept === 'All' || n.department === dept || n.department === 'All';
        const matchSearch = n.title.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchDept && matchSearch;
    });

    const totalPages = Math.ceil(filtered.length / perPage);
    const paged = filtered.slice((page - 1) * perPage, page * perPage);

    return (
        <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-primary to-accent py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Notice Board</h1>
                    <p className="text-blue-100 max-w-2xl mx-auto">Stay updated with the latest announcements, circulars, and important notices.</p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => { setTab(cat); setPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === cat ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <select id="notice-dept" value={dept} onChange={e => { setDept(e.target.value); setPage(1); }} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white">
                        {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                    </select>
                    <div className="flex-1 relative">
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input id="notice-search" type="text" placeholder="Search notices..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none transition" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                    {paged.map(n => <NoticeCard key={n.id} notice={n} />)}
                </div>
                {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><p>No notices found.</p></div>}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition">Prev</button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i} onClick={() => setPage(i + 1)} className={`w-10 h-10 rounded-lg text-sm font-medium transition ${page === i + 1 ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>{i + 1}</button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition">Next</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoticeBoard;
