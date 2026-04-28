import { useState, useEffect } from 'react';
import api from '../../utils/axios';

const AcademicCalendar = () => {
    const [calendarUrl, setCalendarUrl] = useState('');
    const [loading, setLoading] = useState(true);

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
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : calendarUrl ? (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center">
                        {/* PDF Icon */}
                        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM12 17.5a.5.5 0 01-.5-.5v-4a.5.5 0 011 0v4a.5.5 0 01-.5.5zm-2-1.5H8.5v-3H10a1 1 0 010 2H9v1h1a.5.5 0 010 1zm6 0h-1.5V13H16a1.5 1.5 0 010 3h-1v1.5a.5.5 0 01-1 0V13a.5.5 0 01.5-.5H16a1.5 1.5 0 010 3z" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 mb-3">Official Academic Calendar</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-md mx-auto">
                            The academic calendar has been uploaded by the administration. 
                            Click the button below to view or download the official PDF.
                        </p>

                        <a
                            href={calendarUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-primary-700 transition-all transform hover:-translate-y-1 active:scale-95"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Official PDF Calendar
                        </a>

                        <p className="text-xs text-gray-400 mt-6">
                            For queries, contact the academic office.
                        </p>
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
