import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { getAssetUrl } from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const divisions = ['All', 'A', 'B', 'C', 'D'];
const semesters = ['All', 1, 2, 3, 4, 5, 6, 7, 8];

const TimetableBuilder = () => {
    const { user } = useAuth();
    const [timetables, setTimetables] = useState([]);
    const [filters, setFilters] = useState({ semester: 'All', division: 'All' });
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    const loadTimetables = async () => {
        if (!user?.department) {
            setTimetables([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const params = { department: user.department };
            if (filters.semester !== 'All') params.semester = filters.semester;
            if (filters.division !== 'All') params.division = filters.division;

            const response = await api.get('/timetables', { params });
            setTimetables(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to load timetables', error);
            toast.error(error.response?.data?.message || 'Failed to load timetables');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTimetables();
    }, [user?.department, filters.semester, filters.division]);

    const handleDelete = async (timetableId) => {
        if (!window.confirm('Hide this timetable from students?')) {
            return;
        }

        try {
            setDeletingId(timetableId);
            await api.delete(`/timetables/${timetableId}`);
            toast.success('Timetable removed from the active list.');
            await loadTimetables();
        } catch (error) {
            console.error('Failed to delete timetable', error);
            toast.error(error.response?.data?.message || 'Failed to remove timetable');
        } finally {
            setDeletingId(null);
        }
    };

    const activeCount = timetables.length;
    const semesterCount = new Set(timetables.map(item => item.semester)).size;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Timetable Manager</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Review, filter, and retire the live timetable PDFs students can see for {user?.department || 'your department'}.
                    </p>
                </div>
                <Link
                    to="/hod/timetable-upload"
                    className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary-700"
                >
                    Upload New Timetable
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Active PDFs</p>
                    <p className="mt-2 text-3xl font-bold text-blue-900">{activeCount}</p>
                    <p className="mt-1 text-sm text-blue-700">Currently visible in the public timetable section.</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Semesters Covered</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-900">{semesterCount}</p>
                    <p className="mt-1 text-sm text-emerald-700">Distinct semesters represented in the filtered list.</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Current Scope</p>
                    <p className="mt-2 text-lg font-bold text-amber-900">{filters.semester === 'All' ? 'All Semesters' : `Semester ${filters.semester}`}</p>
                    <p className="mt-1 text-sm text-amber-700">{filters.division === 'All' ? 'All divisions' : `Division ${filters.division}`}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                    <div className="w-full lg:max-w-xs">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Semester</label>
                        <select
                            value={filters.semester}
                            onChange={(e) => setFilters(prev => ({ ...prev, semester: e.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-accent"
                        >
                            {semesters.map((semester) => (
                                <option key={semester} value={semester}>
                                    {semester === 'All' ? 'All Semesters' : `Semester ${semester}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full lg:max-w-xs">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Division</label>
                        <select
                            value={filters.division}
                            onChange={(e) => setFilters(prev => ({ ...prev, division: e.target.value }))}
                            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-accent"
                        >
                            {divisions.map((division) => (
                                <option key={division} value={division}>
                                    {division === 'All' ? 'All Divisions' : `Division ${division}`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => setFilters({ semester: 'All', division: 'All' })}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex min-h-[40vh] items-center justify-center rounded-2xl border border-gray-100 bg-white">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                </div>
            ) : timetables.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">No active timetables found</h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Upload a timetable PDF first, then it will show up here for filtering and retirement.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    {timetables.map((timetable) => (
                        <div key={timetable._id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                            Semester {timetable.semester}
                                        </span>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                            Division {timetable.division}
                                        </span>
                                    </div>
                                    <h2 className="mt-3 text-lg font-bold text-gray-900">{timetable.title}</h2>
                                    <p className="mt-1 text-sm text-gray-500">{timetable.department}</p>
                                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
                                        Uploaded by {timetable.uploadedBy} on {new Date(timetable.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <a
                                    href={getAssetUrl(timetable.pdfUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                                >
                                    View PDF
                                </a>
                                <a
                                    href={getAssetUrl(timetable.pdfUrl)}
                                    download
                                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                >
                                    Download
                                </a>
                                <button
                                    onClick={() => handleDelete(timetable._id)}
                                    disabled={deletingId === timetable._id}
                                    className="inline-flex items-center justify-center rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                                >
                                    {deletingId === timetable._id ? 'Removing...' : 'Hide from Students'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimetableBuilder;
