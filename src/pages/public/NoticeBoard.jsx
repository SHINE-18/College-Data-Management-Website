import { useLocation } from 'react-router-dom';
import NoticeCard from '../../components/NoticeCard';
import api from '../../utils/axios';
import { ALL_DEPARTMENTS } from '../../constants/departments';
import { useState, useEffect } from 'react';
import usePageTitle from '../../utils/usePageTitle';

const categories = ['All', 'General', 'Exam', 'Admission', 'Events'];
const departments = ALL_DEPARTMENTS;

const NoticeBoard = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialDept = queryParams.get('dept') || 'All';
    usePageTitle('Notice Board');

    const [tab, setTab] = useState('All');
    const [dept, setDept] = useState(initialDept);
    const [search, setSearch] = useState('');
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 6,
        pages: 1,
        total: 0,
        hasNext: false,
        hasPrev: false
    });

    // Fetch notices from API
    useEffect(() => {
        const fetchNotices = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('page', pagination.page);
                params.append('limit', pagination.limit);

                if (search) {
                    params.append('search', search);
                }
                if (tab !== 'All') {
                    params.append('category', tab);
                }
                if (dept !== 'All') {
                    params.append('department', dept);
                }

                const response = await api.get(`/notices?${params.toString()}`);
                setNotices(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    ...response.data.pagination
                }));
            } catch (error) {
                console.error('Error fetching notices:', error);
                setNotices([]);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchNotices();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, tab, dept, pagination.page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const handleTabChange = (newTab) => {
        setTab(newTab);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleDeptChange = (newDept) => {
        setDept(newDept);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-primary-700 to-primary py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Notice Board</h1>
                    <p className="text-primary-200 max-w-2xl mx-auto">Stay updated with the latest announcements, circulars, and important notices.</p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleTabChange(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === cat ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <select
                        id="notice-dept"
                        value={dept}
                        onChange={e => handleDeptChange(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white"
                    >
                        {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                    </select>
                    <div className="flex-1 relative">
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            id="notice-search"
                            type="text"
                            placeholder="Search notices..."
                            value={search}
                            onChange={e => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none transition"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                            {notices.map(n => <NoticeCard key={n._id} notice={n} />)}
                        </div>

                        {notices.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                <p>No notices found.</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center space-x-2">
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
    );
};

export default NoticeBoard;

