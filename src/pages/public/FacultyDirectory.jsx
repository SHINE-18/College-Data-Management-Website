import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FacultyCard from '../../components/FacultyCard';
import api from '../../utils/axios';
import { ALL_DEPARTMENTS } from '../../constants/departments';
import usePageTitle from '../../utils/usePageTitle';

const designations = ['All', 'HOD', 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];

const FacultyDirectory = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialDept = queryParams.get('dept') || 'All';
    usePageTitle('Faculty Directory');

    const [search, setSearch] = useState('');
    const [desigFilter, setDesigFilter] = useState('All');
    const [deptFilter, setDeptFilter] = useState(initialDept);
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        pages: 1,
        total: 0,
        hasNext: false,
        hasPrev: false
    });

    // Fetch faculty from API
    useEffect(() => {
        const fetchFaculty = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('page', pagination.page);
                params.append('limit', pagination.limit);

                if (search) {
                    params.append('search', search);
                }
                if (desigFilter !== 'All') {
                    params.append('designation', desigFilter);
                }
                if (deptFilter !== 'All') {
                    params.append('department', deptFilter);
                }

                const response = await api.get(`/faculty?${params.toString()}`);
                setFaculty(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    ...response.data.pagination
                }));
            } catch (error) {
                console.error('Error fetching faculty:', error);
                setFaculty([]);
                if (!error.response) setIsOffline(true);
                else setIsOffline(false);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchFaculty();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, desigFilter, deptFilter, pagination.page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="section-title text-2xl">Faculty — {deptFilter === 'All' ? 'Institutional Directory' : deptFilter}</h1>
                    <p className="text-gray-500 text-sm mt-2 pl-4">
                        {deptFilter === 'All'
                            ? 'Meet our distinguished faculty members from across all departments, VGEC'
                            : `Meet our distinguished faculty members from the Department of ${deptFilter}, VGEC`}
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:w-56 shrink-0">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-36">
                            <h3 className="font-heading font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">Filters</h3>

                            {/* Search */}
                            <div className="mb-4">
                                <input
                                    id="faculty-search"
                                    type="text"
                                    placeholder="Search name..."
                                    value={search}
                                    onChange={e => {
                                        setSearch(e.target.value);
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                />
                            </div>

                            {/* Department filter */}
                            <div className="mb-4">
                                <label className="text-xs text-gray-500 font-medium mb-1 block">Department</label>
                                <select
                                    id="dept-filter"
                                    value={deptFilter}
                                    onChange={e => {
                                        setDeptFilter(e.target.value);
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white"
                                >
                                    {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                                </select>
                            </div>

                            {/* Designation filter */}
                            <div>
                                <label className="text-xs text-gray-500 font-medium mb-1 block">Designation</label>
                                <select
                                    id="desig-filter"
                                    value={desigFilter}
                                    onChange={e => {
                                        setDesigFilter(e.target.value);
                                        setPagination(prev => ({ ...prev, page: 1 }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white"
                                >
                                    {designations.map(d => <option key={d} value={d}>{d === 'All' ? 'All Designations' : d}</option>)}
                                </select>
                            </div>

                            <p className="text-xs text-gray-400 mt-4">{pagination.total} faculty found</p>
                        </div>
                    </div>

                    {/* Faculty Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                    {faculty.map(f => <FacultyCard key={f._id} faculty={f} />)}
                                </div>

                                {faculty.length === 0 && (
                                    <div>
                                        {isOffline ? (
                                            <div className="flex flex-col items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-8 py-10 text-center">
                                                <svg className="w-9 h-9 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                                                <p className="text-amber-800 font-bold">Backend server is offline</p>
                                                <p className="text-amber-600 text-sm">Faculty data is loaded from the database. Start the backend server to view faculty profiles.</p>
                                            </div>
                                        ) : (
                                            <div className="text-center py-16 text-gray-400"><p className="text-lg">No faculty found matching your criteria.</p></div>
                                        )}
                                    </div>
                                )}

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="flex justify-center items-center space-x-2 mt-8">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={!pagination.hasPrev}
                                            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition"
                                        >
                                            Prev
                                        </button>
                                        {Array.from({ length: pagination.pages }, (_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handlePageChange(i + 1)}
                                                className={`w-10 h-10 rounded-lg text-sm font-medium transition ${pagination.page === i + 1 ? 'bg-primary text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={!pagination.hasNext}
                                            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDirectory;
