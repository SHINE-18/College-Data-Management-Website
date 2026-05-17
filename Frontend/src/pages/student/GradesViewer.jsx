import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import {
    FiFileText, FiDownload, FiEye, FiFilter,
    FiBookOpen, FiCalendar, FiUser, FiInbox, FiRefreshCw
} from 'react-icons/fi';
import { usePdfPreview } from '../../utils/pdfViewer';

const EXAM_TYPES = ['All', 'Mid-Sem', 'Final', 'Practical', 'Internal', 'Viva', 'University'];
const SEMESTERS = ['All', 1, 2, 3, 4, 5, 6, 7, 8];

const examTypeColors = {
    'Mid-Sem':   'bg-amber-50 text-amber-700 border border-amber-100',
    'Final':     'bg-rose-50 text-rose-700 border border-rose-100',
    'Practical': 'bg-purple-50 text-purple-700 border border-purple-100',
    'Internal':  'bg-sky-50 text-sky-700 border border-sky-100',
    'Viva':      'bg-emerald-50 text-emerald-700 border border-emerald-100',
    'University':'bg-slate-50 text-slate-700 border border-slate-200',
};

const GradesViewer = () => {
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSem, setFilterSem] = useState('All');
    const [filterExam, setFilterExam] = useState('All');
    const { openPreview, PdfModal } = usePdfPreview();

    const fetchResultPdfs = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/student/result-pdfs');
            setPdfs(data);
        } catch (err) {
            console.error('Failed to load result PDFs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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
            <div className="space-y-6 animate-pulse">
                <div className="h-28 bg-white border border-gray-100 rounded-3xl"></div>
                {[1, 2].map(i => (
                    <div key={i} className="h-44 bg-white border border-gray-100 rounded-3xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Minimal Modern Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight font-heading">Academic Results</h1>
                    <p className="text-sm text-gray-400 font-medium mt-1">
                        Access and view your official term-end, midterm, and practical score sheets.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button 
                        onClick={fetchResultPdfs}
                        className="p-2.5 bg-white border border-gray-200/60 rounded-xl hover:border-gray-300 text-gray-500 hover:text-gray-900 transition shadow-sm"
                        title="Reload"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                    </button>
                    <span className="inline-flex items-center gap-2 text-xs bg-primary/5 text-primary border border-primary-100 px-4 py-2 rounded-full font-bold uppercase tracking-wider shadow-sm">
                        <FiFileText /> {pdfs.length} Record{pdfs.length !== 1 ? 's' : ''} Published
                    </span>
                </div>
            </div>

            {/* Premium Filter Controls */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                        <FiFilter /> Filter Records
                    </div>
                    
                    {/* Sem Filter */}
                    <div className="flex flex-wrap gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
                        {['All', 1, 2, 3, 4, 5, 6, 7, 8].slice(0, 5).map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterSem(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    filterSem === s
                                        ? 'bg-white text-primary shadow-sm border border-gray-200/40'
                                        : 'text-gray-500 hover:text-gray-900'
                                }`}
                            >
                                {s === 'All' ? 'All Sems' : `Sem ${s}`}
                            </button>
                        ))}
                        {pdfs.some(pdf => pdf.semester > 4) && (
                            <select
                                value={typeof filterSem === 'number' && filterSem > 4 ? filterSem : 'More'}
                                onChange={e => {
                                    if (e.target.value !== 'More') setFilterSem(Number(e.target.value));
                                }}
                                className={`px-2 py-1 bg-transparent text-xs font-bold border-none focus:outline-none focus:ring-0 ${
                                    typeof filterSem === 'number' && filterSem > 4 ? 'text-primary' : 'text-gray-500'
                                }`}
                            >
                                <option value="More" disabled>More</option>
                                {[5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                            </select>
                        )}
                    </div>

                    {/* Exam Type Filter */}
                    <div className="relative">
                        <select
                            value={filterExam}
                            onChange={e => setFilterExam(e.target.value)}
                            className="appearance-none text-xs font-bold text-gray-700 bg-gray-50 border border-gray-100 hover:border-gray-200 px-4 py-2.5 rounded-xl pr-8 focus:outline-none focus:ring-4 focus:ring-primary/5 cursor-pointer transition-all"
                        >
                            {EXAM_TYPES.map(t => (
                                <option key={t} value={t}>{t === 'All' ? 'All Exams' : t}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                            ▼
                        </div>
                    </div>
                </div>

                {(filterSem !== 'All' || filterExam !== 'All') && (
                    <button
                        onClick={() => { setFilterSem('All'); setFilterExam('All'); }}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3.5 py-2 border border-rose-100 rounded-xl transition"
                    >
                        Reset Filter
                    </button>
                )}
            </div>

            {/* Results Grid / List */}
            {sortedSems.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-16 text-center shadow-sm">
                    <FiInbox className="text-6xl text-gray-200 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-700 text-lg">No scorecards found</h3>
                    <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                        {pdfs.length === 0
                            ? 'Your academic grade sheets will appear here as soon as they are uploaded by your department HOD or faculty.'
                            : 'Try adjusting the Semester or Exam Type filters above.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    {sortedSems.map(sem => (
                        <div key={sem} className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                            {/* Modern Sem Banner */}
                            <div className="px-6 py-4 bg-gradient-to-r from-primary-900 to-primary-700 text-white flex items-center justify-between border-b border-primary-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                                        <FiBookOpen className="text-accent" />
                                    </div>
                                    <div>
                                        <h2 className="font-heading font-black text-sm uppercase tracking-wider">Semester {sem}</h2>
                                        <p className="text-[10px] text-primary-200 font-semibold uppercase tracking-wider">Term Records</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold bg-white/10 border border-white/10 px-3 py-1 rounded-full">
                                    {grouped[sem].length} File{grouped[sem].length !== 1 ? 's' : ''} Published
                                </span>
                            </div>

                            {/* Clean List Items */}
                            <ul className="divide-y divide-gray-100/80 stagger-fade-in">
                                {grouped[sem].map(pdf => (
                                    <li key={pdf._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 hover:bg-gray-50/50 transition-all duration-300 group">
                                        <div className="flex items-start gap-4 min-w-0">
                                            {/* Beautiful File Red Badge */}
                                            <div className="shrink-0 w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                                                <FiFileText className="text-rose-500 text-xl" />
                                            </div>

                                            {/* Details Block */}
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-gray-800 group-hover:text-primary transition truncate">{pdf.title}</h4>
                                                {pdf.description && (
                                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{pdf.description}</p>
                                                )}
                                                <div className="flex flex-wrap items-center gap-3.5 mt-2">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${examTypeColors[pdf.examType] || 'bg-gray-100 text-gray-600'}`}>
                                                        {pdf.examType}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                                                        <FiCalendar className="text-gray-300" /> {pdf.academicYear}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                                                        <FiUser className="text-gray-300" /> {pdf.uploadedBy?.name || 'Faculty'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons with fine hover micro-animations */}
                                        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                                            <button
                                                onClick={() => openPreview(pdf.pdfUrl, pdf.title)}
                                                className="inline-flex items-center justify-center gap-1.5 text-xs text-primary font-bold bg-gray-50 hover:bg-primary hover:text-white border border-gray-200/60 hover:border-primary px-4 py-2 rounded-xl transition-all duration-300 shadow-sm"
                                            >
                                                <FiEye className="w-3.5 h-3.5" /> View
                                            </button>
                                            <a
                                                href={pdf.pdfUrl}
                                                download
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50/50 hover:bg-emerald-600 hover:text-white border border-emerald-100 hover:border-emerald-600 px-4 py-2 rounded-xl transition-all duration-300 shadow-sm"
                                            >
                                                <FiDownload className="w-3.5 h-3.5" /> Download
                                            </a>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
            <PdfModal />
        </div>
    );
};

export default GradesViewer;
