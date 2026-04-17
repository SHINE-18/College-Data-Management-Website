import { useState } from 'react';
import { getAssetUrl } from '../utils/axios';

const categoryColors = {
    General: 'bg-gray-50 text-gray-700 border border-gray-200',
    Exam: 'bg-red-50 text-red-700 border border-red-200',
    Admission: 'bg-green-50 text-green-700 border border-green-200',
    Events: 'bg-purple-50 text-purple-700 border border-purple-200',
    Placement: 'bg-blue-50 text-blue-700 border border-blue-200',
    Other: 'bg-gray-50 text-gray-700 border border-gray-200',
};

// Format date from API (createdAt timestamp) or legacy format
const formatDate = (dateValue) => {
    if (!dateValue) return '';

    // If it's already a formatted string (legacy format)
    if (typeof dateValue === 'string' && dateValue.includes(',')) {
        return dateValue;
    }

    // Parse the date
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return dateValue;

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const NoticeCard = ({ notice }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Handle synced notices, API format (createdAt), and legacy format (date)
    const displayDate = notice.publishedAt || notice.createdAt || notice.date;
    const displayTitle = notice.title || '';
    const displayContent = notice.content || notice.description || '';
    const displayCategory = notice.category || 'General';
    const displayPostedBy = notice.postedBy || notice.postedBy || 'Administration';
    const hasAttachment = notice.attachment || notice.attachment === true;
    const externalSourceUrl = notice.sourceUrl || null;
    const isExternalNotice = notice.source === 'GTU';

    const fileUrl = hasAttachment && typeof notice.attachment === 'string'
        ? getAssetUrl(notice.attachment)
        : null;

    const handleCardClick = () => {
        setIsExpanded(!isExpanded);
    };

    const handleDownloadClick = (e) => {
        e.stopPropagation();
    };

    return (
        <>
            {/* The Normal Grid Card */}
            <div
                onClick={handleCardClick}
                className="cursor-pointer bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 group relative overflow-hidden flex flex-col h-full"
            >
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex flex-wrap gap-2">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[displayCategory] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                                {displayCategory}
                            </span>
                            {isExternalNotice && (
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                    GTU
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-400 font-medium">{formatDate(displayDate)}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300 leading-snug">
                        {displayTitle}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 leading-relaxed whitespace-pre-wrap line-clamp-2 flex-grow">
                        {displayContent}
                    </p>
                    {displayContent && displayContent.length > 80 && (
                        <div className="mb-4">
                            <span className="text-xs font-bold text-primary group-hover:text-primary-700 transition flex items-center">
                                Read More
                                <svg className="w-3 h-3 ml-1 transform transition-transform duration-300 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                        <span className="text-xs text-gray-400 font-medium">By: {displayPostedBy}</span>
                        <div className="flex items-center gap-3">
                            {externalSourceUrl && (
                                <a
                                    href={externalSourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleDownloadClick}
                                    className="text-xs text-slate-500 font-semibold hover:text-slate-700 transition flex items-center space-x-1"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h4m0 0v4m0-4l-8 8m-4-4v6h6" />
                                    </svg>
                                    <span>Source</span>
                                </a>
                            )}
                            {hasAttachment && fileUrl && (
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={handleDownloadClick}
                                    className="text-xs text-primary font-semibold hover:text-primary-700 transition flex items-center space-x-1"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Download</span>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* The Expanded Modal View */}
            {isExpanded && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm"
                    onClick={handleCardClick}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in"
                        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        {/* Modal Header */}
                        <div className="p-6 sm:p-8 border-b border-gray-100 flex justify-between items-start">
                            <div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${categoryColors[displayCategory] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                                        {displayCategory}
                                    </span>
                                    {isExternalNotice && (
                                        <span className="inline-block text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                            GTU Circular
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                                    {displayTitle}
                                </h2>
                            </div>
                            <button onClick={handleCardClick} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors ml-4 shrink-0">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body (Scrollable) */}
                        <div className="p-6 sm:p-8 overflow-y-auto">
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
                                <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg"><svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> {formatDate(displayDate)}</span>
                                <span className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg"><svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> {displayPostedBy}</span>
                                {isExternalNotice && externalSourceUrl && (
                                    <a
                                        href={externalSourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center bg-amber-50 px-3 py-1.5 rounded-lg text-amber-700 hover:bg-amber-100 transition"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h4m0 0v4m0-4l-8 8m-4-4v6h6" /></svg>
                                        Official Source
                                    </a>
                                )}
                            </div>

                            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed text-base sm:text-lg">
                                {displayContent}
                            </div>
                        </div>

                        {/* Modal Footer / Attachments */}
                        {hasAttachment && fileUrl && (
                            <div className="p-6 sm:p-8 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-500">Attachment Available</span>
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition shadow-lg shadow-primary/30"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Download PDF
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default NoticeCard;

