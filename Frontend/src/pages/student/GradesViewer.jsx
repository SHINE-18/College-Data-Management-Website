import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import {
    FiFileText, FiDownload, FiEye, FiFilter,
    FiBookOpen, FiCalendar, FiUser, FiChevronDown, FiInbox
} from 'react-icons/fi';

const EXAM_TYPES = ['All', 'Mid-Sem', 'Final', 'Practical', 'Internal', 'Viva', 'University'];
const SEMESTERS = ['All', 1, 2, 3, 4, 5, 6, 7, 8];

const examTypeColors = {
    'Mid-Sem':   'bg-yellow-50 text-yellow-700 border border-yellow-200',
    'Final':     'bg-red-50 text-red-700 border border-red-200',
    'Practical': 'bg-purple-50 text-purple-700 border border-purple-200',
    'Internal':  'bg-blue-50 text-blue-700 border border-blue-200',
    'Viva':      'bg-green-50 text-green-700 border border-green-200',
    'University':'bg-gray-50 text-gray-700 border border-gray-200',
};

// Use Google Docs Viewer to embed PDFs that Cloudinary serves as raw attachments.
// The viewer fetches the PDF server-side and renders it inline inside the iframe.
const googleDocsViewerUrl = (url) =>
    `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

const GradesViewer = () => {
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSem, setFilterSem] = useState('All');
    const [filterExam, setFilterExam] = useState('All');
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        const fetchResultPdfs = async () => {
            try {
                const { data } = await api.get('/student/result-pdfs');
                setPdfs(data);
            } catch (err) {
                console.error('Failed to load result PDFs', err);
            } finally {
                setLoading(false);
            }
        };
        fetchResultPdfs();
    }, []);

    const filtered = pdfs.filter(pdf => {
        const semMatch = filterSem === 'All' || String(pdf.semester) === String(filterSem);
        const examMatch = filterExam === 'All' || pdf.examType === filterExam;
        return semMatch && examMatch;
    });

    // Group filtered results by semester
    const grouped = filtered.reduce((acc, pdf) => {
        const key = pdf.semester;
        if (!acc[key]) acc[key] = [];
        acc[key].push(pdf);
        return acc;
    }, {});
    const sortedSems = Object.keys(grouped).sort((a, b) => b - a);

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Academic Results</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and download official result PDFs published by your faculty.
                    </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full font-medium">
                    <FiFileText /> {pdfs.length} Result{pdfs.length !== 1 ? 's' : ''} Available
                </span>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FiFilter className="text-gray-400" /> Filters:
                </div>
                <div className="relative">
                    <select
                        value={filterSem}
                        onChange={e => setFilterSem(e.target.value)}
                        className="appearance-none text-sm border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                    >
                        {SEMESTERS.map(s => (
                            <option key={s} value={s}>{s === 'All' ? 'All Semesters' : `Semester ${s}`}</option>
                        ))}
                    </select>
                    <FiChevronDown className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none text-xs" />
                </div>
                <div className="relative">
                    <select
                        value={filterExam}
                        onChange={e => setFilterExam(e.target.value)}
                        className="appearance-none text-sm border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                    >
                        {EXAM_TYPES.map(t => <option key={t} value={t}>{t === 'All' ? 'All Exam Types' : t}</option>)}
                    </select>
                    <FiChevronDown className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none text-xs" />
                </div>
                {(filterSem !== 'All' || filterExam !== 'All') && (
                    <button
                        onClick={() => { setFilterSem('All'); setFilterExam('All'); }}
                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Results */}
            {sortedSems.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <FiInbox className="text-5xl text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No results found.</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {pdfs.length === 0
                            ? 'Your faculty has not published any results yet.'
                            : 'Try adjusting the filters above.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedSems.map(sem => (
                        <div key={sem} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Semester header */}
                            <div className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center gap-2">
                                <FiBookOpen />
                                <h2 className="text-sm font-semibold tracking-wide">Semester {sem}</h2>
                                <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                    {grouped[sem].length} file{grouped[sem].length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* PDF cards */}
                            <ul className="divide-y divide-gray-50">
                                {grouped[sem].map(pdf => (
                                    <li key={pdf._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition">
                                        {/* Icon */}
                                        <div className="shrink-0 w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                                            <FiFileText className="text-red-500 text-lg" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{pdf.title}</p>
                                            {pdf.description && (
                                                <p className="text-xs text-gray-400 truncate mt-0.5">{pdf.description}</p>
                                            )}
                                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${examTypeColors[pdf.examType] || 'bg-gray-100 text-gray-600'}`}>
                                                    {pdf.examType}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                                    <FiCalendar className="text-gray-300" /> {pdf.academicYear}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                                    <FiUser className="text-gray-300" /> {pdf.uploadedBy?.name || 'Faculty'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => setPreviewUrl(previewUrl === pdf.pdfUrl ? null : pdf.pdfUrl)}
                                                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition font-medium"
                                            >
                                                <FiEye /> {previewUrl === pdf.pdfUrl ? 'Close' : 'View'}
                                            </button>
                                            <a
                                                href={pdf.pdfUrl}
                                                download
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition font-medium"
                                            >
                                                <FiDownload /> Download
                                            </a>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* Inline PDF Preview Modal */}
            {previewUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setPreviewUrl(null)}>
                    <div
                        className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <FiFileText className="text-red-500" /> Result PDF Preview
                            </p>
                            <div className="flex items-center gap-2">
                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1 font-medium"
                                >
                                    <FiDownload /> Download
                                </a>
                                <button
                                    onClick={() => setPreviewUrl(null)}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg transition"
                                >
                                    Close ✕
                                </button>
                            </div>
                        </div>
                        <iframe
                            src={googleDocsViewerUrl(previewUrl)}
                            title="Result PDF Preview"
                            className="flex-1 w-full"
                            style={{ minHeight: '70vh' }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradesViewer;
