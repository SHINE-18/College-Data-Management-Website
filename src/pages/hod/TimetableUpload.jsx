import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';

const departments = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT'];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const divisions = ['A', 'B', 'C', 'D'];

const TimetableUpload = () => {
    const [formData, setFormData] = useState({
        title: '',
        department: 'CSE',
        semester: 1,
        division: 'A'
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Auto-generate title when department/semester/division changes
            title: name === 'department' || name === 'semester' || name === 'division'
                ? `Timetable - ${name === 'department' ? value : formData.department} - Sem ${name === 'semester' ? value : formData.semester} - ${name === 'division' ? value : formData.division}`
                : prev.title
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                toast.error('Only PDF files are allowed');
                return;
            }
            if (selectedFile.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            setFile(selectedFile);
            // Create preview URL
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            toast.error('Please select a PDF file');
            return;
        }

        setLoading(true);
        
        try {
            const data = new FormData();
            data.append('title', formData.title || `Timetable - ${formData.department} - Sem ${formData.semester} - ${formData.division}`);
            data.append('department', formData.department);
            data.append('semester', formData.semester);
            data.append('division', formData.division);
            data.append('pdf', file);
            data.append('uploadedBy', 'HOD');

            await api.post('/timetables', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success('Timetable uploaded successfully!');
            // Reset form
            setFormData({
                title: '',
                department: 'CSE',
                semester: 1,
                division: 'A'
            });
            setFile(null);
            setPreviewUrl(null);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload timetable');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Upload Timetable</h1>
                    <p className="text-gray-500 text-sm mt-1">Upload PDF timetables for students to view and download.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white"
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                <select
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white"
                                >
                                    {semesters.map(sem => (
                                        <option key={sem} value={sem}>Semester {sem}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                                <select
                                    name="division"
                                    value={formData.division}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white"
                                >
                                    {divisions.map(div => (
                                        <option key={div} value={div}>Division {div}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Timetable title"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload PDF</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-accent transition-colors">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="timetable-pdf"
                                />
                                <label htmlFor="timetable-pdf" className="cursor-pointer">
                                    {file ? (
                                        <div className="space-y-2">
                                            <svg className="w-10 h-10 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-sm text-gray-600 font-medium">{file.name}</p>
                                            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <p className="text-sm text-gray-500">Click to upload PDF</p>
                                            <p className="text-xs text-gray-400">Maximum file size: 10MB</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !file}
                            className="w-full bg-primary text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    <span>Upload Timetable</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Preview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                    {previewUrl ? (
                        <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden">
                            <iframe
                                src={previewUrl}
                                className="w-full h-full"
                                title="PDF Preview"
                            />
                        </div>
                    ) : (
                        <div className="h-[600px] border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                            <div className="text-center text-gray-400">
                                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-sm">PDF preview will appear here</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Upload Guidelines</h4>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                    <li>Only PDF files are accepted</li>
                    <li>Maximum file size is 10MB</li>
                    <li>File name should be descriptive (e.g., "CSE-Sem3-A-Timetable.pdf")</li>
                    <li>The timetable will be visible to all students of the selected department</li>
                </ul>
            </div>
        </div>
    );
};

export default TimetableUpload;

