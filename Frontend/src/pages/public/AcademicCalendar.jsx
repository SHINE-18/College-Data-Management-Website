import { useState, useEffect } from 'react';
import api from '../../utils/axios';

// Cloudinary 'raw' URLs force downloads — Google Docs Viewer renders them inline in the browser
const googleDocsViewerUrl = (url) =>
    `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

const AcademicCalendar = () => {
    const [calendarUrl, setCalendarUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [iframeKey, setIframeKey] = useState(0); // force reload

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                if (data.academicCalendarPdf) {
                    setCalendarUrl(data.academicCalendarPdf);
                }
            } catch (err) {
                console.error('Failed to fetch settings', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className="animate-fade-in">
            {/* Hero */}
            <div className="bg-gradient-to-r from-primary-700 to-primary py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4 font-heading">Academic Calendar</h1>
                    <p className="text-primary-100 max-w-2xl mx-auto opacity-90">
                        Official schedule of academic activities, examinations, holidays, and events
                        as published by the institute.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : calendarUrl ? (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                        {/* Header bar */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Official Academic Calendar</p>
                                    <p className="text-xs text-gray-400">PDF Document</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setIframeLoaded(false); setIframeKey(k => k + 1); }}
                                    title="Reload preview"
                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition font-medium"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Reload
                                </button>
                                <a
                                    href={calendarUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition font-medium"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Open
                                </a>
                                <a
                                    href={calendarUrl}
                                    download
                                    className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition font-medium"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download
                                </a>
                            </div>
                        </div>

                        {/* PDF Preview via Google Docs Viewer */}
                        <div className="relative" style={{ height: '80vh', minHeight: '500px' }}>
                            {!iframeLoaded && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
                                    <p className="text-sm text-gray-400">Loading PDF preview…</p>
                                    <p className="text-xs text-gray-300 mt-1">If it doesn't appear, click <strong>Reload</strong> or <strong>Open</strong> above</p>
                                </div>
                            )}
                            <iframe
                                key={iframeKey}
                                src={googleDocsViewerUrl(calendarUrl)}
                                title="Academic Calendar PDF"
                                className="w-full h-full border-0"
                                onLoad={() => setIframeLoaded(true)}
                                allow="fullscreen"
                            />
                        </div>
                    </div>
                ) : (
                    /* No PDF uploaded yet */
                    <div className="bg-white rounded-3xl shadow-xl border border-dashed border-gray-200 p-16 text-center">
                        <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-700 mb-2">Calendar Not Published Yet</h2>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto leading-relaxed">
                            The academic calendar for this year has not been uploaded yet.
                            Please check back later or contact the HOD / academic office.
                        </p>
                        <span className="mt-6 inline-block bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-amber-100">
                            Pending Upload
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcademicCalendar;

