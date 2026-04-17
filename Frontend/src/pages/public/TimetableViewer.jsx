import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api, { getAssetUrl } from '../../utils/axios';
import { DEPARTMENTS } from '../../constants/departments';

const departments = DEPARTMENTS;
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const divisions = ['All', 'A', 'B', 'C', 'D'];

const TimetableViewer = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const urlDept = queryParams.get('dept');
    const urlDivision = queryParams.get('division');

    // Validate if urlDept exists in our departments list, otherwise fallback to first dept
    const initialDept = departments.includes(urlDept) ? urlDept : (departments[0] || 'Computer Engineering');

    const [dept, setDept] = useState(initialDept);
    const [sem, setSem] = useState(1);
    const [division, setDivision] = useState(divisions.includes(urlDivision) ? urlDivision : 'All');
    const [timetables, setTimetables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTimetable, setSelectedTimetable] = useState(null);

    // Fetch timetables when department, semester, or division changes
    useEffect(() => {
        fetchTimetables();
    }, [dept, sem, division]);

    const fetchTimetables = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                department: dept,
                semester: String(sem)
            });

            if (division !== 'All') {
                params.set('division', division);
            }

            const response = await api.get(`/timetables?${params.toString()}`);
            setTimetables(response.data);

            if (response.data.length === 0) {
                setSelectedTimetable(null);
                return;
            }

            const stillSelected = response.data.find(item => item._id === selectedTimetable?._id);
            setSelectedTimetable(stillSelected || response.data[0]);
        } catch (error) {
            console.error('Error fetching timetables:', error);
            setTimetables([]);
            setSelectedTimetable(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (timetable) => {
        window.open(getAssetUrl(timetable.pdfUrl), '_blank');
    };

    return (
        <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-primary-700 to-primary py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Timetable</h1>
                    <p className="text-primary-200 max-w-2xl mx-auto">View class schedules for any department and semester.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select
                            id="tt-dept"
                            value={dept}
                            onChange={e => { setDept(e.target.value); setSelectedTimetable(null); }}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white"
                        >
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <select
                            id="tt-sem"
                            value={sem}
                            onChange={e => { setSem(Number(e.target.value)); setSelectedTimetable(null); }}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white"
                        >
                            {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                        <select
                            id="tt-division"
                            value={division}
                            onChange={e => { setDivision(e.target.value); setSelectedTimetable(null); }}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white"
                        >
                            {divisions.map(d => <option key={d} value={d}>{d === 'All' ? 'All Divisions' : `Division ${d}`}</option>)}
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                )}

                {/* Timetable List */}
                {!loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Timetable Cards */}
                        <div className="lg:col-span-1 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">Available Timetables</h3>

                            {timetables.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-gray-500 text-sm">
                                        No timetable available for {dept} Semester {sem}{division !== 'All' ? `, Division ${division}` : ''}.
                                    </p>
                                    <p className="text-gray-400 text-xs mt-2">
                                        Please contact your HOD to upload the timetable.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {timetables.map(timetable => (
                                        <div
                                            key={timetable._id}
                                            onClick={() => setSelectedTimetable(timetable)}
                                            className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${selectedTimetable?._id === timetable._id
                                                ? 'border-accent ring-2 ring-accent/20'
                                                : 'border-gray-100'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{timetable.title}</h4>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Division: {timetable.division}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Uploaded: {new Date(timetable.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDownload(timetable); }}
                                                    className="p-2 text-accent hover:bg-accent/10 rounded-lg transition"
                                                    title="Download PDF"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* PDF Viewer */}
                        <div className="lg:col-span-2">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>

                            {selectedTimetable ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{selectedTimetable.title}</h4>
                                            <p className="text-sm text-gray-500">
                                                {selectedTimetable.department} - Semester {selectedTimetable.semester} - Division {selectedTimetable.division}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(selectedTimetable)}
                                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition flex items-center space-x-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            <span>Download PDF</span>
                                        </button>
                                    </div>
                                    <div className="h-[600px] bg-gray-50">
                                        <iframe
                                            src={getAssetUrl(selectedTimetable.pdfUrl)}
                                            className="w-full h-full"
                                            title="Timetable PDF"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-[600px] flex items-center justify-center">
                                    <div className="text-center text-gray-400">
                                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p>Select a timetable to preview</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimetableViewer;
