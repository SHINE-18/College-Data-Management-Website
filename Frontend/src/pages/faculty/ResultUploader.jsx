import { useState, useEffect, useRef } from 'react';
import api, { getAssetUrl } from '../../utils/axios';
import toast from 'react-hot-toast';
import {
    FiUploadCloud, FiTrash2, FiFile, FiChevronDown,
    FiCalendar, FiBookOpen, FiUser, FiEye
} from 'react-icons/fi';
import { usePdfPreview } from '../../utils/pdfViewer';

const EXAM_TYPES = ['Mid-Sem', 'Final', 'Practical', 'Internal', 'Viva', 'University'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const currentAcademicYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-indexed
    return month >= 6 ? `${year}-${String(year + 1).slice(-2)}` : `${year - 1}-${String(year).slice(-2)}`;
};

const ResultUploader = () => {
    const [pdfs, setPdfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [semester, setSemester] = useState('1');
    const [examType, setExamType] = useState('Mid-Sem');
    const [academicYear, setAcademicYear] = useState(currentAcademicYear());
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [filterSem, setFilterSem] = useState('all');
    const { openPreview, PdfModal } = usePdfPreview();

    const fetchPdfs = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/faculty/result-pdfs');
            setPdfs(data);
        } catch (err) {
            console.error('Fetch error:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to load uploaded result PDFs';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPdfs(); }, []);

    const handleFileChange = (file) => {
        if (!file) return;
        if (file.type !== 'application/pdf') {
            toast.error('Only PDF files are allowed');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            toast.error('File size must be under 20 MB');
            return;
        }
        setSelectedFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileChange(file);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!title.trim()) return toast.error('Title is required');
        if (!selectedFile) return toast.error('Please select a PDF file');

        const formData = new FormData();
        formData.append('resultPdf', selectedFile);
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('semester', semester);
        formData.append('examType', examType);
        formData.append('academicYear', academicYear.trim());

        try {
            setUploading(true);
            await api.post('/faculty/result-pdfs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('✅ Result PDF uploaded successfully!');
            setTitle('');
            setDescription('');
            setSemester('1');
            setExamType('Mid-Sem');
            setAcademicYear(currentAcademicYear());
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchPdfs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this result PDF?')) return;
        try {
            await api.delete(`/faculty/result-pdfs/${id}`);
            toast.success('Deleted successfully');
            setPdfs(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Delete failed');
        }
    };

    const filtered = filterSem === 'all' ? pdfs : pdfs.filter(p => String(p.semester) === filterSem);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Result PDF Uploader</h1>
                <p className="text-sm text-gray-500 mt-1">Upload semester result PDFs — students will see them in their Results section.</p>
            </div>

            {/* Upload Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-5 flex items-center gap-2">
                    <FiUploadCloud className="text-blue-600" /> Upload New Result PDF
                </h2>
                <form onSubmit={handleUpload} className="space-y-5">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Sem 3 Mid-Sem Results 2024-25"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Description (optional)</label>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Any additional notes..."
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                            />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Semester <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    value={semester}
                                    onChange={e => setSemester(e.target.value)}
                                    className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                                >
                                    {SEMESTERS.map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                                <FiChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Exam Type <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    value={examType}
                                    onChange={e => setExamType(e.target.value)}
                                    className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                                >
                                    {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <FiChevronDown className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Academic Year <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={academicYear}
                                onChange={e => setAcademicYear(e.target.value)}
                                placeholder="e.g. 2024-25"
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                            />
                        </div>
                    </div>

                    {/* Drop zone */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${dragOver
                            ? 'border-blue-500 bg-blue-50'
                            : selectedFile
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/40'
                            }`}
                    >
                        {selectedFile ? (
                            <>
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <FiFile className="text-green-600 text-xl" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-green-700">{selectedFile.name}</p>
                                    <p className="text-xs text-green-500 mt-0.5">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB — Click to change</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FiUploadCloud className="text-blue-600 text-xl" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-gray-700">Drag & drop PDF here</p>
                                    <p className="text-xs text-gray-400 mt-0.5">or click to browse — Max 20 MB</p>
                                </div>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            onChange={e => handleFileChange(e.target.files[0])}
                            className="hidden"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-sm shadow-blue-200"
                        >
                            {uploading ? (
                                <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Uploading...</>
                            ) : (
                                <><FiUploadCloud /> Publish Result</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Uploaded PDFs List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-800">Published Results ({pdfs.length})</h2>
                    <div className="relative">
                        <select
                            value={filterSem}
                            onChange={e => setFilterSem(e.target.value)}
                            className="appearance-none text-sm border border-gray-200 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="all">All Semesters</option>
                            {SEMESTERS.map(s => <option key={s} value={String(s)}>Sem {s}</option>)}
                        </select>
                        <FiChevronDown className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none text-xs" />
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <FiFile className="text-4xl text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">No result PDFs published yet.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {filtered.map(pdf => (
                            <li key={pdf._id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition group">
                                <div className="shrink-0 w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                                    <FiFile className="text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{pdf.title}</p>
                                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <FiBookOpen className="text-blue-400" /> Sem {pdf.semester}
                                        </span>
                                        <span className="inline-block bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">{pdf.examType}</span>
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <FiCalendar className="text-gray-400" /> {pdf.academicYear}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                            <FiUser className="text-gray-400" /> {pdf.uploadedBy?.name || 'Faculty'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => openPreview(getAssetUrl(pdf.pdfUrl), pdf.title)}
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition font-medium"
                                    >
                                        <FiEye /> View
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pdf._id)}
                                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition font-medium"
                                    >
                                        <FiTrash2 /> Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <PdfModal />
        </div>
    );
};

export default ResultUploader;
