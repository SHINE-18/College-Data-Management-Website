import { useState } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { FaUpload } from 'react-icons/fa';

const AssignmentPoster = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    const [semester, setSemester] = useState('1');
    const [dueDate, setDueDate] = useState('');
    const [totalMarks, setTotalMarks] = useState('10');
    const [file, setFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !subject || !dueDate) {
            toast.error("Title, Subject, and Due Date are required.");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('subject', subject);
        formData.append('semester', semester);
        formData.append('dueDate', dueDate);
        formData.append('totalMarks', totalMarks);
        if (file) formData.append('assignmentFile', file);

        try {
            await api.post('/faculty/assignments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Assignment posted successfully!");
            setTitle(''); setDescription(''); setSubject(''); setFile(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to post assignment');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-gray-900">Post New Assignment</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title <span className="text-red-500">*</span></label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Lab 1: Data Structures Overview" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
                        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester <span className="text-red-500">*</span></label>
                        <select value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <option key={sem} value={sem}>Semester {sem}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
                        <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                        <input type="number" min="0" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description / Instructions</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Provide any additional context or rules for submission..." />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attach Reference File (Optional)</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FaUpload className="w-8 h-8 mb-3 text-gray-400" />
                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-500">PDF, DOCX, ZIP (MAX. 10MB)</p>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        {file && (
                            <p className="mt-2 text-sm text-green-600 truncate">Selected: {file.name}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary-700 text-white px-8 py-2.5 rounded-lg font-medium text-sm transition shadow-lg disabled:opacity-50">
                        {isSubmitting ? 'Posting...' : 'Post Assignment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssignmentPoster;
