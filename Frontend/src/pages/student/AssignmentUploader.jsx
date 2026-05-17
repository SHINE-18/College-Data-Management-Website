import { useState, useEffect } from 'react';
import api, { getAssetUrl } from '../../utils/axios';
import toast from 'react-hot-toast';
import { FiUploadCloud, FiFileText, FiCheckCircle, FiClock, FiEye, FiDownload, FiCheckSquare, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { usePdfPreview } from '../../utils/pdfViewer';

const AssignmentUploader = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { openPreview, PdfModal } = usePdfPreview();

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/student/assignments');
            setAssignments(data || []);
        } catch (error) {
            console.error("Failed to fetch assignments", error);
            toast.error("Could not fetch assignments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !selectedAssignment) {
            toast.error("Please select an assignment and choose a file first.");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('assignmentId', selectedAssignment);
        formData.append('submissionFile', file);

        try {
            await api.post('/student/submissions', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Assignment submitted successfully!");
            setFile(null);
            setSelectedAssignment(null);
            fetchAssignments(); // Refresh status
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit assignment');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-24 bg-white border border-gray-100 rounded-3xl"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-32 bg-white border border-gray-100 rounded-2xl" />)}
                    </div>
                    <div className="h-56 bg-white border border-gray-100 rounded-2xl" />
                </div>
            </div>
        );
    }

    const pending = assignments.filter(a => !a.isSubmitted);
    const submitted = assignments.filter(a => a.isSubmitted);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Minimal Elegant Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight font-heading">Course Assignments</h1>
                    <p className="text-sm text-gray-400 font-medium mt-1">
                        Download reference materials and upload your homework, lab reports, or project files.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button 
                        onClick={fetchAssignments}
                        className="p-2.5 bg-white border border-gray-200/60 rounded-xl hover:border-gray-300 text-gray-500 hover:text-gray-900 transition shadow-sm"
                        title="Reload"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                    </button>
                    <span className="inline-flex items-center gap-2 text-xs bg-accent/10 text-accent border border-accent-200 px-4 py-2 rounded-full font-bold uppercase tracking-wider shadow-sm">
                        <FiAlertCircle /> {pending.length} Pending Submission{pending.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ══════ ASSIGNMENTS LISTINGS (Left Column) ══════ */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Pending Assignments Section */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FiClock className="text-accent" /> Pending Submissions
                        </h2>

                        {pending.length === 0 ? (
                            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 text-center rounded-3xl p-12 text-gray-400 shadow-sm border-2 border-dashed">
                                <FiCheckSquare className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                                <h3 className="font-bold text-gray-700 text-sm">All caught up!</h3>
                                <p className="text-xs text-gray-400 mt-1">No pending assignments at the moment. Keep it up!</p>
                            </div>
                        ) : (
                            <div className="space-y-4 stagger-fade-in">
                                {pending.map(assignment => {
                                    const isSelected = selectedAssignment === assignment._id;
                                    const daysLeft = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                                    return (
                                        <div 
                                            key={assignment._id} 
                                            onClick={() => setSelectedAssignment(assignment._id)}
                                            className={`bg-white/80 backdrop-blur-sm rounded-3xl p-6 cursor-pointer border transition-all duration-300 shadow-sm group ${
                                                isSelected 
                                                    ? 'border-primary ring-4 ring-primary/5 -translate-y-0.5' 
                                                    : 'border-gray-200/60 hover:border-primary/40 hover:-translate-y-0.5'
                                            }`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition text-base">{assignment.title}</h3>
                                                    <p className="text-xs text-gray-400 font-semibold mt-1">
                                                        Course: <span className="text-gray-600 font-bold">{assignment.subject}</span> | Total Marks: <span className="text-gray-600 font-bold">{assignment.totalMarks}</span>
                                                    </p>
                                                </div>
                                                <span className={`self-start text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                                                    daysLeft <= 2 
                                                        ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' 
                                                        : daysLeft <= 5 
                                                            ? 'bg-amber-50 text-amber-600 border-amber-100' 
                                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                    Due {new Date(assignment.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ({daysLeft <= 0 ? 'Today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`})
                                                </span>
                                            </div>

                                            <div className="bg-gray-50/60 border border-gray-100 p-4 rounded-2xl text-xs text-gray-500 font-medium leading-relaxed">
                                                {assignment.description || "No specific instructions provided."}
                                            </div>

                                            {assignment.fileUrl && (
                                                <div className="mt-4 pt-4 border-t border-gray-100/80 flex flex-wrap items-center gap-3">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); openPreview(getAssetUrl(assignment.fileUrl), assignment.title); }}
                                                        className="inline-flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/5 hover:bg-primary hover:text-white px-3.5 py-2 rounded-xl transition-all duration-300"
                                                    >
                                                        <FiEye className="w-3.5 h-3.5" /> Reference Material
                                                    </button>
                                                    <a 
                                                        href={getAssetUrl(assignment.fileUrl)} 
                                                        download 
                                                        onClick={e => e.stopPropagation()}
                                                        className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-bold bg-slate-50 hover:bg-slate-200 px-3.5 py-2 rounded-xl border border-slate-200/50 transition-all duration-300"
                                                    >
                                                        <FiDownload className="w-3.5 h-3.5" /> Download
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Completed Assignments Section */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FiCheckCircle className="text-emerald-500" /> Completed Work
                        </h2>

                        {submitted.length === 0 ? (
                            <p className="text-xs text-gray-400 font-medium italic pl-1">No completed assignments recorded yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-fade-in">
                                {submitted.map(assignment => (
                                    <div key={assignment._id} className="bg-gray-50/50 border border-gray-200/60 rounded-3xl p-5 flex justify-between items-center opacity-85 hover:opacity-100 transition duration-300 group">
                                        <div className="min-w-0 pr-2">
                                            <h4 className="font-bold text-sm text-gray-600 group-hover:text-primary transition truncate">{assignment.title}</h4>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{assignment.subject}</p>
                                        </div>
                                        <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                                            <FiCheckCircle /> Done
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ══════ UPLOAD CONSOLE (Right Column) ══════ */}
                <div className="lg:col-span-1">
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-6 shadow-sm sticky top-24">
                        <h3 className="text-lg font-black text-gray-900 tracking-tight font-heading mb-4 pb-2 border-b border-gray-100">
                            Submission Box
                        </h3>

                        {selectedAssignment ? (
                            <form onSubmit={handleSubmit} className="space-y-5" id="assignment-submission-form">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Target Task</span>
                                    <div className="font-bold text-xs text-primary bg-primary/5 p-3 rounded-xl border border-primary-100/50 truncate">
                                        {assignments.find(a => a._id === selectedAssignment)?.title}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Upload Files</span>
                                    <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 hover:border-primary/50 bg-slate-50/50 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all duration-300">
                                        <div className="flex flex-col items-center justify-center p-5 text-center">
                                            <FiUploadCloud className="w-8 h-8 mb-2.5 text-gray-400 group-hover:text-primary transition" />
                                            <span className="text-xs font-bold text-gray-700">Choose submission file</span>
                                            <span className="text-[9px] text-gray-400 mt-1 font-semibold uppercase tracking-wider">PDF, DOC, DOCX, ZIP (Max 10MB)</span>
                                        </div>
                                        <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.zip,.rar" />
                                    </label>
                                    
                                    {file && (
                                        <div className="mt-3 flex items-center gap-2 p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                                            <FiFileText className="text-emerald-500 shrink-0" />
                                            <span className="text-xs font-bold text-emerald-800 truncate flex-1">{file.name}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 pt-2">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || !file} 
                                        className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-800 text-white py-3 rounded-xl font-extrabold text-sm transition shadow-lg shadow-primary/10 disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Uploading Work...' : 'Submit Assignment'}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => { setSelectedAssignment(null); setFile(null); }} 
                                        className="w-full text-xs text-gray-400 hover:text-gray-700 font-bold py-2 transition"
                                    >
                                        Cancel Submission
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                                <FiUploadCloud className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-xs font-bold text-gray-500">Ready to Submit?</p>
                                <p className="text-[10px] text-gray-400 mt-1 max-w-[180px] mx-auto leading-relaxed">
                                    Select any pending assignment card from the left panel to open the submission slot.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
            <PdfModal />
        </div>
    );
};

export default AssignmentUploader;
