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
    // Handle both API format (createdAt) and legacy format (date)
    const displayDate = notice.createdAt || notice.date;
    const displayTitle = notice.title || '';
    const displayContent = notice.content || notice.description || '';
    const displayCategory = notice.category || 'General';
    const displayPostedBy = notice.postedBy || notice.postedBy || 'Administration';
    const hasAttachment = notice.attachment || notice.attachment === true;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[displayCategory] || 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
                        {displayCategory}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{formatDate(displayDate)}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300 leading-snug">
                    {displayTitle}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                    {displayContent}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-medium">By: {displayPostedBy}</span>
                    {hasAttachment && (
                        <button className="text-xs text-primary font-semibold hover:text-primary-700 transition flex items-center space-x-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Download</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoticeCard;

