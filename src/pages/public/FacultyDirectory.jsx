import { useState, useEffect } from 'react';
import FacultyCard from '../../components/FacultyCard';
import api from '../../utils/axios';

const designations = ['All', 'HOD', 'Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];

const FacultyDirectory = () => {
    const [search, setSearch] = useState('');
    const [desigFilter, setDesigFilter] = useState('All');
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
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

                const response = await api.get(`/faculty?${params.toString()}`);
                setFaculty(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    ...response.data.pagination
                }));
            } catch (error) {
                console.error('Error fetching faculty:', error);
                // Fallback to empty array on error
                setFaculty([]);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchFaculty();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, desigFilter, pagination.page]);

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
                    <h1 className="section-title text-2xl">Faculty — Computer Engineering</h1>
                    <p className="text-gray-500 text-sm mt-2 pl-4">Meet our distinguished faculty members from the Department of Computer Engineering, VGEC</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters (IIT Madras-inspired) */}
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
                                    <div className="text-center py-16 text-gray-400">
                                        <p className="text-lg">No faculty found matching your criteria.</p>
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

