import { useState, useEffect } from 'react';
import api, { getAssetUrl } from '../../utils/axios';
import { FaDownload, FaSearch, FaBookOpen } from 'react-icons/fa';

const SyllabusArchive = () => {
    const [syllabi, setSyllabi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [semester, setSemester] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchSyllabi = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/academics/syllabi?semester=${semester}&search=${search}`);
                setSyllabi(data);
            } catch (error) {
                console.error("Failed to load syllabi", error);
                if (!error.response) setIsOffline(true);
                else setIsOffline(false);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSyllabi, 300);
        return () => clearTimeout(timeoutId);
    }, [semester, search]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 font-heading tracking-tight sm:text-5xl">Syllabus Archive</h1>
                <p className="max-w-2xl mx-auto text-lg text-gray-500">Access and download the official curriculum for all semesters in Computer Engineering.</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-end">
                    <div className="lg:col-span-4 relative">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Search Course</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                placeholder="e.g. Data Structures, Python..."
                            />
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Filter by Semester</label>
                        <select
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                        >
                            <option value="">All Semesters</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                            ))}
                        </select>
                    </div>

                    <div className="lg:col-span-5 text-right">
                        <p className="text-sm text-gray-400 italic mb-1">Showing {syllabi.length} courses</p>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : syllabi.length === 0 ? (
                isOffline ? (
                    <div className="flex flex-col items-center gap-3 bg-amber-50 border border-amber-200 rounded-3xl px-8 py-12 text-center">
                        <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                        <p className="text-amber-800 font-bold text-lg">Backend server is offline</p>
                        <p className="text-amber-600 text-sm">Syllabus data is stored in the database. Start the backend server to view syllabi.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-16 text-center shadow-inner border-2 border-dashed border-gray-100">
                        <FaBookOpen className="text-6xl text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No courses found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                    </div>
                )
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {syllabi.map((syllabus) => (
                        <div key={syllabus._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 border border-gray-100 p-6 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider">
                                    SEM {syllabus.semester}
                                </span>
                                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">
                                    {syllabus.credits} Credits
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem] mb-1">
                                {syllabus.courseTitle}
                            </h3>
                            <p className="text-sm font-mono text-gray-400 mb-6">{syllabus.courseCode}</p>

                            <a
                                href={getAssetUrl(syllabus.syllabusUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center space-x-2 bg-gray-900 hover:bg-primary text-white py-3 rounded-xl transition font-bold shadow-lg shadow-gray-200 hover:shadow-primary/30"
                            >
                                <FaDownload className="text-sm" /> <span>Download PDF</span>
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SyllabusArchive;
