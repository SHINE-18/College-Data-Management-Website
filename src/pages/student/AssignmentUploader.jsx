import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { getAssetUrl } from '../../utils/axios';
import toast from 'react-hot-toast';
import { FaCloudUploadAlt, FaFilePdf, FaCheckCircle, FaClock } from 'react-icons/fa';

const AssignmentUploader = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const { data } = await api.get('/student/assignments');
            setAssignments(data);
        } catch (error) {
            console.error("Failed to fetch assignments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !selectedAssignment) {
            toast.error("Please select an assignment and a file to upload.");
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

    if (loading) return <div className="animate-pulse h-64 bg-gray-100 rounded-xl"></div>;

    const pending = assignments.filter(a => !a.isSubmitted);
    const submitted = assignments.filter(a => a.isSubmitted);

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Pending Tasks Panel */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                        <FaClock className="text-accent" /> <span>Pending Submissions</span>
                    </h2>

                    {pending.length === 0 ? (
                        <div className="bg-white border text-center border-gray-100 rounded-xl p-8 text-gray-400">
                            All caught up! No pending assignments.
                        </div>
                    ) : (
                        pending.map(assignment => (
                            <div key={assignment._id} onClick={() => setSelectedAssignment(assignment._id)}
                                className={`bg-white rounded-xl shadow-sm border p-5 cursor-pointer transition ${selectedAssignment === assignment._id ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-primary/50'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900">{assignment.title}</h3>
                                    <span className="text-xs font-semibold px-2.5 py-1 bg-red-50 text-red-600 rounded-full">
                                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{assignment.subject} | Marks: {assignment.totalMarks}</p>
                                <p className="text-xs text-gray-500 line-clamp-2 bg-gray-50 p-3 rounded-lg">{assignment.description || "No description provided."}</p>

                                {assignment.fileUrl && (
                                    <a href={getAssetUrl(assignment.fileUrl)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center space-x-2 text-xs text-primary hover:underline font-medium">
                                        <FaFilePdf /> <span>Download Reference file</span>
                                    </a>
                                )}
                            </div>
                        ))
                    )}

                    <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2 pt-6">
                        <FaCheckCircle className="text-green-500" /> <span>Completed</span>
                    </h2>

                    {submitted.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No assignments submitted yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {submitted.map(assignment => (
                                <div key={assignment._id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex justify-between items-center opacity-75 grayscale sepia-0 hover:grayscale-0 transition">
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-700 line-through">{assignment.title}</h4>
                                        <p className="text-xs text-gray-500">Submitted on time</p>
                                    </div>
                                    <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">Done</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upload Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-lg shadow-primary/5 border border-primary/10 p-6 sticky top-24">
                        <h3 className="text-lg font-bold text-primary mb-4 border-b border-gray-100 pb-2">Submit Work</h3>

                        {selectedAssignment ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Target Assignment</p>
                                    <div className="font-medium text-sm text-gray-900 bg-blue-50 p-2 rounded border border-blue-100 truncate">
                                        {assignments.find(a => a._id === selectedAssignment)?.title}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-primary/30 border-dashed rounded-lg cursor-pointer bg-primary/5 hover:bg-primary/10 transition">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FaCloudUploadAlt className="w-8 h-8 mb-2 text-primary/60" />
                                            <p className="text-xs text-primary font-medium">Upload submission</p>
                                            <p className="text-[10px] text-gray-500 mt-1">PDF, ZIP files only</p>
                                        </div>
                                        <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.zip,.rar" />
                                    </label>
                                    {file && <p className="mt-2 text-xs text-green-600 font-medium truncate">Selected: {file.name}</p>}
                                </div>

                                <button type="submit" disabled={isSubmitting || !file} className="w-full bg-primary hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium text-sm transition shadow-md disabled:opacity-50 mt-4">
                                    {isSubmitting ? 'Uploading...' : 'Confirm Submission'}
                                </button>
                                <button type="button" onClick={() => { setSelectedAssignment(null); setFile(null); }} className="w-full text-xs text-gray-500 hover:text-gray-700 mt-2">
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                <p>Select a pending assignment from the left to upload your work.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AssignmentUploader;
