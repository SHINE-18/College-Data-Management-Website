import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../utils/axios';
import { ALL_DEPARTMENTS } from '../../constants/departments';
import usePageTitle from '../../utils/usePageTitle';

const eventTypes = ['All', 'Conference', 'Workshop', 'Cultural', 'Sports', 'Placement', 'Lecture', 'Competition'];
const departments = [...ALL_DEPARTMENTS, 'Placement Cell', 'Cultural Committee', 'Sports Committee', 'Alumni Cell'];

const typeColors = {
    Conference: 'bg-blue-100 text-blue-700',
    Placement: 'bg-green-100 text-green-700',
    Sports: 'bg-orange-100 text-orange-700',
    Workshop: 'bg-purple-100 text-purple-700',
    Cultural: 'bg-pink-100 text-pink-700',
    Competition: 'bg-red-100 text-red-700',
    Lecture: 'bg-teal-100 text-teal-700',
};

const Events = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialDept = queryParams.get('dept') || 'All';
    usePageTitle('Events');

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [typeFilter, setTypeFilter] = useState('All');
    const [deptFilter, setDeptFilter] = useState(initialDept);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 9,
        pages: 1,
        total: 0,
        hasNext: false,
        hasPrev: false
    });

    // Fetch events from API
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('page', pagination.page);
                params.append('limit', pagination.limit);

                if (search) {
                    params.append('search', search);
                }
                if (typeFilter !== 'All') {
                    params.append('type', typeFilter);
                }
                if (deptFilter !== 'All') {
                    params.append('department', deptFilter);
                }

                const response = await api.get(`/events?${params.toString()}`);
                setEvents(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    ...response.data.pagination
                }));
            } catch (error) {
                console.error('Error fetching events:', error);
                setEvents([]);
                if (!error.response) setIsOffline(true);
                else setIsOffline(false);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchEvents();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, typeFilter, deptFilter, pagination.page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-primary-700 to-primary py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Events</h1>
                    <p className="text-primary-200 max-w-2xl mx-auto">Explore upcoming events, workshops, guest lectures, and activities.</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <select
                        id="event-type"
                        value={typeFilter}
                        onChange={e => {
                            setTypeFilter(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                    >
                        {eventTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
                    </select>

                    <select
                        id="event-dept"
                        value={deptFilter}
                        onChange={e => {
                            setDeptFilter(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                    >
                        {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                    </select>

                    <div className="flex-1 relative">
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            id="event-search"
                            type="text"
                            placeholder="Search events..."
                            value={search}
                            onChange={e => {
                                setSearch(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map(event => (
                                <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                                    <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                                        <svg className="w-16 h-16 text-primary/20 group-hover:text-primary/40 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[event.type] || 'bg-gray-100 text-gray-700'}`}>
                                                {event.type}
                                            </span>
                                            <span className="text-xs bg-primary/5 text-primary font-medium px-2.5 py-1 rounded-full">
                                                {event.department || 'All'}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary transition">
                                            {event.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                                            {event.description}
                                        </p>
                                        <div className="flex items-center space-x-2 text-sm text-accent font-medium">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>{formatDate(event.date)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {events.length === 0 && (
                            <div className="col-span-3">
                                {isOffline ? (
                                    <div className="flex flex-col items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-8 py-10 text-center">
                                        <svg className="w-9 h-9 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                                        <p className="text-amber-800 font-bold">Backend server is offline</p>
                                        <p className="text-amber-600 text-sm">Events are stored in the database. Start the backend server to view them.</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400"><p>No events found.</p></div>
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
    );
};

export default Events;

