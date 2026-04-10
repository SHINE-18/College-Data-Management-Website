import { useState, useEffect } from 'react';
import api from '../utils/axios';

const AnnouncementTicker = ({ department = 'All' }) => {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                // Fetch the 5 most recent active notices
                const { data } = await api.get('/notices', {
                    params: { department, limit: 5 }
                });
                setNotices(data.data || []);
            } catch (error) {
                console.error('Failed to fetch announcements:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, [department]);

    if (loading || notices.length === 0) return null;

    return (
        <div className="bg-primary-700 text-white overflow-hidden">
            <div className="max-w-9xl sm:px-6 lg:px-8 flex items-center h-9">
                <div className="font-heading font-bold text-sm uppercase tracking-wider mr-4 whitespace-nowrap bg-primary-900 px-3 py-1 rounded shrink-0">
                    {department === 'All' ? 'Latest Announcements' : 'Department Updates'}
                </div>
                <div className="overflow-hidden flex-1">
                    <div className="animate-marquee whitespace-nowrap flex space-x-12">
                        {notices.map((n, i) => (
                            <a
                                key={n._id || i}
                                href={n.attachment ? n.attachment : `/notices?id=${n._id}`}
                                target={n.attachment ? "_blank" : "_self"}
                                rel="noreferrer"
                                className="text-sm hover:text-primary-200 transition inline-flex items-center"
                            >
                                <span className="text-primary-300 mr-2">▸</span>
                                {n.title}
                                <span className="text-primary-400 ml-2 text-xs">
                                    ({new Date(n.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')})
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementTicker;

