import { useState } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { FaCloudUploadAlt, FaBook, FaFolderOpen, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AcademicsManager = () => {
    const [mode, setMode] = useState('syllabus'); // 'syllabus' or 'resource'

    // Syllabus State
    const [sylData, setSylData] = useState({ courseTitle: '', courseCode: '', semester: '1', credits: '4' });
    const [sylFile, setSylFile] = useState(null);

    // Resource State
    const [resData, setResData] = useState({ title: '', subject: '', semester: '1', resourceType: 'PPT', description: '', externalLink: '' });
    const [resFile, setResFile] = useState(null);

    // Calendar State
    const [calFile, setCalFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleSylSubmit = async (e) => {
        e.preventDefault();
        if (!sylFile) return toast.error("Please select a syllabus PDF");

        setLoading(true);
        const formData = new FormData();
        Object.keys(sylData).forEach(key => formData.append(key, sylData[key]));
        formData.append('syllabusFile', sylFile);

        try {
            await api.post('/academics/syllabi', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Syllabus uploaded successfully!");
            setSylData({ courseTitle: '', courseCode: '', semester: '1', credits: '4' });
            setSylFile(null);
        } catch (error) {
            toast.error("Upload failed");
        } finally { setLoading(false); }
    };

    const handleResSubmit = async (e) => {
        e.preventDefault();
        if (resData.resourceType !== 'Link' && !resFile) return toast.error("Please select a file");

        setLoading(true);
        const formData = new FormData();
        Object.keys(resData).forEach(key => formData.append(key, resData[key]));
        if (resFile) formData.append('resourceFile', resFile);

        try {
            await api.post('/academics/resources', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Resource added successfully!");
            setResData({ title: '', subject: '', semester: '1', resourceType: 'PPT', description: '', externalLink: '' });
            setResFile(null);
        } catch (error) {
            toast.error("Upload failed");
        } finally { setLoading(false); }
    };

    const handleCalSubmit = async (e) => {
        e.preventDefault();
        if (!calFile) return toast.error("Please select a calendar PDF");

        setLoading(true);
        const formData = new FormData();
        formData.append('calendarPdf', calFile);

        try {
            await api.post('/settings/calendar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Academic Calendar updated successfully!");
            setCalFile(null);
        } catch (error) {
            toast.error("Upload failed");
        } finally { setLoading(false); }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 font-heading tracking-tight">Academics Management</h1>
                <div className="bg-gray-100 p-1 rounded-lg flex space-x-1 shadow-inner">
                    <button onClick={() => setMode('syllabus')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${mode === 'syllabus' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Syllabus</button>
                    <button onClick={() => setMode('resource')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${mode === 'resource' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Resources</button>
                    {(user?.role === 'hod' || user?.role === 'super_admin') && (
                        <button onClick={() => setMode('calendar')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${mode === 'calendar' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Calendar</button>
                    )}
                </div>
            </div>

            {mode === 'syllabus' ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-primary/5 p-6 border-b border-gray-100 flex items-center space-x-3">
                        <FaBook className="text-primary text-xl" />
                        <h2 className="text-xl font-bold text-gray-900">Upload New Syllabus Document</h2>
                    </div>
                    <form onSubmit={handleSylSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Course Title</label>
                                <input type="text" value={sylData.courseTitle} onChange={e => setSylData({ ...sylData, courseTitle: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. Data Structures & Algorithms" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Subject Code</label>
                                <input type="text" value={sylData.courseCode} onChange={e => setSylData({ ...sylData, courseCode: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. 3130702" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Semester</label>
                                    <select value={sylData.semester} onChange={e => setSylData({ ...sylData, semester: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Credits</label>
                                    <input type="number" value={sylData.credits} onChange={e => setSylData({ ...sylData, credits: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" required />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Syllabus PDF File</label>
                            <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:border-primary/50 transition bg-gray-50/50 flex flex-col items-center">
                                <FaCloudUploadAlt className="text-4xl text-gray-300 mb-3" />
                                <p className="text-sm text-gray-500 font-medium">{sylFile ? sylFile.name : 'Select or drop syllabus PDF'}</p>
                                <input type="file" onChange={e => setSylFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf" />
                            </div>
                        </div>

                        <button disabled={loading} className="w-full bg-primary hover:bg-primary-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50">
                            {loading ? 'Uploading...' : 'Publish Syllabus'}
                        </button>
                    </form>
                </div>
            ) : mode === 'resource' ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-orange-50 p-6 border-b border-gray-100 flex items-center space-x-3">
                        <FaFolderOpen className="text-orange-500 text-xl" />
                        <h2 className="text-xl font-bold text-gray-900">Add E-Resource / Study Material</h2>
                    </div>
                    <form onSubmit={handleResSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Resource Title</label>
                                <input type="text" value={resData.title} onChange={e => setResData({ ...resData, title: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="e.g. Unit 2: Stack & Queues PPT" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Subject Name</label>
                                <input type="text" value={resData.subject} onChange={e => setResData({ ...resData, subject: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" placeholder="e.g. Data Structures" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Semester</label>
                                    <select value={resData.semester} onChange={e => setResData({ ...resData, semester: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                                    <select value={resData.resourceType} onChange={e => setResData({ ...resData, resourceType: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-primary">
                                        {['PPT', 'Notes', 'Video', 'Link', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Short Description</label>
                                <textarea value={resData.description} onChange={e => setResData({ ...resData, description: e.target.value })} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none resize-none" placeholder="Brief about the content..."></textarea>
                            </div>

                            {resData.resourceType === 'Link' ? (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">External URL (Drive, YouTube, etc.)</label>
                                    <input type="url" value={resData.externalLink} onChange={e => setResData({ ...resData, externalLink: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-blue-600 font-medium" placeholder="https://..." required />
                                </div>
                            ) : (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-3">Upload File</label>
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:border-orange-200 transition bg-gray-50/50 flex flex-col items-center">
                                        <FaCloudUploadAlt className="text-4xl text-gray-300 mb-3" />
                                        <p className="text-sm text-gray-500 font-medium">{resFile ? resFile.name : 'Select file (PPT, PDF, ZIP)'}</p>
                                        <input type="file" onChange={e => setResFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button disabled={loading} className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50">
                            {loading ? 'Adding...' : 'Add to Library'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-blue-50 p-6 border-b border-gray-100 flex items-center space-x-3">
                        <FaCalendarAlt className="text-blue-600 text-xl" />
                        <h2 className="text-xl font-bold text-gray-900">Upload Official Academic Calendar</h2>
                    </div>
                    <form onSubmit={handleCalSubmit} className="p-8 space-y-6">
                        <p className="text-sm text-gray-600">This file will be displayed on the public Academic Calendar page for all students and visitors.</p>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Calendar PDF File</label>
                            <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-10 hover:border-blue-400 transition bg-gray-50/50 flex flex-col items-center">
                                <FaCloudUploadAlt className="text-5xl text-gray-300 mb-3" />
                                <p className="text-sm text-gray-500 font-medium">{calFile ? calFile.name : 'Select official calendar PDF'}</p>
                                <input type="file" onChange={e => setCalFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf" />
                            </div>
                        </div>

                        <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50">
                            {loading ? 'Uploading Calendar...' : 'Update Public Calendar'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AcademicsManager;
