import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import NoticeCard from '../../components/NoticeCard';
import api from '../../utils/axios';
import { ALL_DEPARTMENTS } from '../../constants/departments';
import usePageTitle from '../../utils/usePageTitle';
import { link } from 'framer-motion/client';

const categories = ['All', 'General', 'Exam', 'Admission', 'Events'];
const departments = ALL_DEPARTMENTS;
const gtuQuickFacts = [
    { label: '', value: 'Official GTU circulars', link: 'https://www.gtu.ac.in/Circular.aspx' },
    { label: '', value: 'GTU Student Portal' ,link: 'https://student.gtu.ac.in/' },
    { label: '', value: 'GTU Exam Results', link: 'https://www.gtu.ac.in/Result.aspx' },
];

const NoticeBoard = ({
    sourceMode = 'college',
    pageTitle = 'Notice Board',
    heroTitle = 'Notice Board',
    heroDescription = 'Stay updated with the latest announcements, circulars, and important notices.'
}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialDept = queryParams.get('dept') || 'All';
    const isGtuPage = sourceMode === 'gtu';

    usePageTitle(pageTitle);

    const [tab, setTab] = useState('All');
    const [dept, setDept] = useState(initialDept);
    const [search, setSearch] = useState('');
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 6,
        pages: 1,
        total: 0,
        hasNext: false,
        hasPrev: false
    });

    useEffect(() => {
        const nextParams = new URLSearchParams(location.search);
        const nextDept = nextParams.get('dept') || 'All';
        setDept(prev => (prev === nextDept ? prev : nextDept));
    }, [location.search]);

    const updateNoticeBoardUrl = (nextDept) => {
        const params = new URLSearchParams();

        if (nextDept && nextDept !== 'All') {
            params.set('dept', nextDept);
        }

        const searchString = params.toString();
        navigate(
            {
                pathname: location.pathname,
                search: searchString ? `?${searchString}` : ''
            },
            { replace: true }
        );
    };

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
                if (isGtuPage) {
                    params.append('source', 'GTU');
                } else {
                    params.append('excludeSource', 'GTU');
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
                if (!error.response) setIsOffline(true);
                else setIsOffline(false);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchNotices();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, tab, dept, pagination.page, isGtuPage]);

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
        updateNoticeBoardUrl(newDept);
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    return (
        <div className="animate-fade-in">
            {isGtuPage ? (
                <div className="bg-white border-b border-slate-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                            <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1">
                                <div className="relative shrink-0">
                                    {/* <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-primary/10 bg-gradient-to-br from-white via-rose-50 to-amber-50 shadow-lg flex items-center justify-center">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-rose-200 bg-white flex items-center justify-center text-primary font-heading font-black text-lg tracking-wide">
                                            GTU
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 rounded-full bg-rose-600 text-white text-[9px] sm:text-[10px] px-2 py-1 font-bold uppercase tracking-[0.18em] shadow-md">
                                        Circulars
                                    </div> */}
                                </div>

                                <div>
                                    <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.35em] text-primary/70 mb-2">
                                        Official Circular Feed
                                    </p>
                                    <h1 className="font-heading text-2xl sm:text-4xl lg:text-[2.65rem] font-black uppercase tracking-tight text-primary-700 leading-tight">
                                        Gujarat Technological University
                                    </h1>
                                    <p className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.28em] text-rose-600">
                                        International Innovative University
                                    </p>
                                    {/* <p className="mt-3 text-base sm:text-2xl font-bold text-primary-700">
                                        Accredited with A+ grade by NAAC
                                    </p> */}
                                    <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-600 leading-relaxed">
                                        {heroDescription}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 lg:w-[25rem]">
                                {gtuQuickFacts.map(fact => (
                                    <div key={fact.label} className="rounded-2xl border border-slate-400 bg-slate-100 text-primary-700 text-center px-4 py-3">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                                            {fact.label}
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {fact.value}
                                        </p>
                                        {fact.link && (
                                            <a
                                                href={fact.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 inline-block text-xs text-primary hover:underline">
                                                Learn more
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="h-1 bg-gradient-to-r from-rose-600 via-primary to-rose-600" />
                </div>
            ) : (
                <div className="bg-gradient-to-r from-primary-700 to-primary py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{heroTitle}</h1>
                        <p className="text-primary-200 max-w-2xl mx-auto">{heroDescription}</p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* <div className={`mb-8 rounded-3xl border px-5 py-5 sm:px-6 sm:py-6 ${isGtuPage ? 'border-amber-200 bg-gradient-to-r from-amber-50 via-white to-rose-50 shadow-sm' : 'border-blue-200 bg-blue-50'}`}> */}
                    {/* <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${isGtuPage ? 'bg-primary text-white' : 'bg-blue-700 text-white'}`}>
                                    {isGtuPage ? 'GTU Notice Desk' : 'College Notice Desk'}
                                </span>
                                {isGtuPage && (
                                    <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800 border border-amber-200">
                                        Engineering Feed
                                    </span>
                                )}
                            </div>

                            <p className={`text-lg font-heading font-bold ${isGtuPage ? 'text-slate-900' : 'text-blue-900'}`}>
                                {isGtuPage ? 'Imported circulars from official GTU pages, arranged for faster browsing.' : 'Showing notices posted through your college portal.'}
                            </p>
                            <p className={`mt-2 text-sm leading-relaxed ${isGtuPage ? 'text-slate-600' : 'text-blue-700'}`}>
                                {isGtuPage
                                    ? 'Each card keeps the original source link so students can cross-check the full announcement, attachment, or circular on the university side whenever needed.'
                                    : 'GTU circulars are separated on their own page so internal college announcements stay easier to scan.'}
                            </p>
                        </div> */}

                        {/* <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                            {isGtuPage && (
                                <div className="grid grid-cols-2 gap-2 text-center">
                                    <div className="rounded-2xl bg-white px-4 py-3 border border-amber-100 min-w-[8.5rem]">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Notices</p>
                                        <p className="mt-1 text-xl font-black text-primary">{pagination.total}</p>
                                    </div>
                                    <div className="rounded-2xl bg-white px-4 py-3 border border-amber-100 min-w-[8.5rem]">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Departments</p>
                                        <p className="mt-1 text-xl font-black text-primary">{dept === 'All' ? 'All' : '1'}</p>
                                    </div>
                                </div>
                            )}

                            <Link
                                to={isGtuPage ? '/notices' : '/gtu-circulars'}
                                className={`inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] border transition ${isGtuPage
                                    ? 'text-primary border-primary/15 hover:bg-primary hover:text-white'
                                    : 'text-blue-700 border-blue-200 hover:bg-blue-100'}`}
                            >
                                {isGtuPage ? 'View College Notices' : 'View GTU Circulars'}
                            </Link>
                        </div> */}
                    {/* </div> */}
                {/* </div> */}

                <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleTabChange(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === cat
                                ? isGtuPage
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'bg-primary text-white shadow-md'
                                : isGtuPage
                                    ? 'bg-white text-slate-600 border border-amber-100 hover:bg-amber-50'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <select
                        id="notice-dept"
                        value={dept}
                        onChange={e => handleDeptChange(e.target.value)}
                        className={`px-4 py-2.5 border rounded-lg text-sm focus:ring-2 outline-none bg-white ${isGtuPage
                            ? 'border-amber-100 focus:ring-amber-200'
                            : 'border-gray-200 focus:ring-accent'}`}
                    >
                        {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                    </select>
                    <div className="flex-1 relative">
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input
                            id="notice-search"
                            type="text"
                            placeholder={isGtuPage ? 'Search GTU circulars...' : 'Search college notices...'}
                            value={search}
                            onChange={e => handleSearchChange(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 outline-none transition ${isGtuPage
                                ? 'border-amber-100 focus:ring-amber-200'
                                : 'border-gray-200 focus:ring-accent'}`}
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
                            <div className="col-span-3">
                                {isOffline ? (
                                    <div className="flex flex-col items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-8 py-10 text-center">
                                        <svg className="w-9 h-9 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                                        <p className="text-amber-800 font-bold">Backend server is offline</p>
                                        <p className="text-amber-600 text-sm">Notices are stored in the database. Start the backend server to view them.</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-400">
                                        <p>{isGtuPage ? 'No GTU circulars found for the current filters.' : 'No college notices found for the current filters.'}</p>
                                    </div>
                                )}
                            </div>
                        )}

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
                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition ${pagination.page === i + 1
                                            ? 'bg-primary text-white'
                                            : isGtuPage
                                                ? 'border border-amber-100 hover:bg-amber-50'
                                                : 'border border-gray-200 hover:bg-gray-50'}`}
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
