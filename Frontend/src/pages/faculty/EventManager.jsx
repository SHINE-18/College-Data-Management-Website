import { useState, useEffect } from 'react';
import api, { getAssetUrl } from '../../utils/axios';
import toast from 'react-hot-toast';
import { FaCalendarPlus, FaImage, FaTrash, FaMapMarkerAlt, FaClock, FaList } from 'react-icons/fa';

const EventManager = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        type: 'Conference',
        venue: ''
    });
    const [image, setImage] = useState(null);
    const [activeTab, setActiveTab] = useState('add'); // 'add' or 'list'

    useEffect(() => {
        if (activeTab === 'list') {
            fetchEvents();
        }
    }, [activeTab]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/events?limit=50');
            setEvents(data.data || []);
        } catch (error) {
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) {
            data.append('image', image);
        }

        try {
            await api.post('/events', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Event created successfully!");
            setFormData({ title: '', description: '', date: '', type: 'Conference', venue: '' });
            setImage(null);
            setActiveTab('list');
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            await api.delete(`/events/${id}`);
            toast.success("Event deleted!");
            fetchEvents();
        } catch (error) {
            toast.error("Failed to delete event");
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading bg-primary-600 bg-clip-text text-transparent transform transition-all duration-500">Event Manager</h1>
                    <p className="text-gray-500 mt-1">Create and manage upcoming college events.</p>
                </div>
                <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-1">
                    <button onClick={() => setActiveTab('add')} className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'add' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <FaCalendarPlus /> Post Event
                    </button>
                    <button onClick={() => setActiveTab('list')} className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'list' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <FaList /> Manage Events
                    </button>
                </div>
            </div>

            {activeTab === 'add' ? (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"></div>
                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-800 font-medium text-lg" placeholder="e.g. Annual Tech Symposium 2026" required />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Date & Time</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaClock className="text-gray-400" />
                                    </div>
                                    <input type="datetime-local" name="date" value={formData.date} onChange={handleChange} className="w-full pl-11 pr-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 font-medium" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Event Type</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl outline-none font-medium text-indigo-700 focus:ring-2 focus:ring-indigo-500">
                                    {['Conference', 'Workshop', 'Cultural', 'Sports', 'Placement', 'Lecture', 'Competition', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Venue / Location</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaMapMarkerAlt className="text-gray-400" />
                                    </div>
                                    <input type="text" name="venue" value={formData.venue} onChange={handleChange} className="w-full pl-11 pr-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl outline-none text-gray-700 font-medium" placeholder="e.g. Main Auditorium" required />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Event Details</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl outline-none resize-none text-gray-700 leading-relaxed" placeholder="Describe the event details, schedule, guests..." required></textarea>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Event Banner / Image</label>
                                <div className="relative border-2 border-dashed border-indigo-200 rounded-3xl p-10 hover:border-indigo-500 transition-colors bg-indigo-50/30 flex flex-col items-center justify-center group overflow-hidden">
                                    {image ? (
                                        <div className="text-center z-10">
                                            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                                                <FaImage className="text-3xl" />
                                            </div>
                                            <p className="font-bold text-gray-800">{image.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">Click to change</p>
                                        </div>
                                    ) : (
                                        <div className="text-center z-10 transition-transform group-hover:scale-105">
                                            <div className="w-20 h-20 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                                <FaImage className="text-3xl" />
                                            </div>
                                            <p className="font-bold text-indigo-900 text-lg">Upload Banner Image</p>
                                            <p className="text-sm text-indigo-500/70 mt-1">JPEG, PNG, WEBP (Max 5MB)</p>
                                        </div>
                                    )}
                                    <input type="file" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50" accept="image/*" />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 sm:py-5 rounded-2xl font-bold shadow-xl shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-70 text-lg mt-8 relative overflow-hidden group">
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? 'Publishing Event...' : 'Publish Event'}
                            </span>
                            <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-bold">Event & Date</th>
                                    <th className="px-6 py-4 font-bold">Type</th>
                                    <th className="px-6 py-4 font-bold">Venue</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading && events.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">Loading events...</td></tr>
                                ) : events.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">No events found.</td></tr>
                                ) : (
                                    events.map(event => (
                                        <tr key={event._id} className="hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    {event.image ? (
                                                        <img src={getAssetUrl(event.image)} alt={event.title} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-300">
                                                            <FaImage />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-gray-900">{event.title}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md text-xs font-bold">{event.type}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">{event.venue}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDelete(event._id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventManager;
