import { useState, useEffect } from 'react';
import api, { getAssetUrl } from '../../utils/axios';
import { FaFilePowerpoint, FaFileAlt, FaVideo, FaLink, FaDownload, FaFilter } from 'react-icons/fa';

const ResourceLibrary = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [semester, setSemester] = useState('');
    const [type, setType] = useState('');

    useEffect(() => {
        const fetchResources = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/academics/resources?semester=${semester}&type=${type}`);
                setResources(data);
            } catch (error) {
                console.error("Failed to fetch resources", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, [semester, type]);

    const getIcon = (type) => {
        switch (type) {
            case 'PPT': return <FaFilePowerpoint className="text-orange-500" />;
            case 'Notes': return <FaFileAlt className="text-blue-500" />;
            case 'Video': return <FaVideo className="text-red-500" />;
            case 'Link': return <FaLink className="text-green-500" />;
            default: return <FaFileAlt className="text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-heading">E-Content & Resources</h1>
                    <p className="text-gray-500 mt-1">Access class presentations, notes, and expert material.</p>
                </div>

                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-2">
                    <FaFilter className="text-gray-400 ml-2" />
                    <select value={semester} onChange={e => setSemester(e.target.value)} className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer text-gray-600 font-medium">
                        <option value="">All Semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => <option key={sem} value={sem}>Sem {sem}</option>)}
                    </select>
                    <div className="w-px h-6 bg-gray-200"></div>
                    <select value={type} onChange={e => setType(e.target.value)} className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer text-gray-600 font-medium">
                        <option value="">All Types</option>
                        {['PPT', 'Notes', 'Video', 'Link'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>)}
                </div>
            ) : resources.length === 0 ? (
                <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-gray-100">
                    <p className="text-gray-400">No resources matches your criteria yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {resources.map((res) => (
                        <div key={res._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                            <div className="p-5 flex-grow">
                                <div className="text-3xl mb-4 p-3 bg-gray-50 rounded-xl w-fit group-hover:bg-primary/5 transition-colors">
                                    {getIcon(res.resourceType)}
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-2">{res.title}</h3>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 mb-3">{res.subject}</p>
                                <p className="text-sm text-gray-500 line-clamp-3 bg-gray-50/50 p-2 rounded-lg">{res.description || "Digital resource for semester study."}</p>
                            </div>

                            <div className="px-5 pb-5 pt-2">
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                                    <span className="bg-gray-100 px-2 py-1 rounded">Sem {res.semester}</span>
                                    <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                                </div>

                                {res.resourceType === 'Link' ? (
                                    <a href={res.externalLink} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-2.5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition shadow-sm">
                                        View Content
                                    </a>
                                ) : (
                                    <a href={getAssetUrl(res.fileUrl)} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-700 transition shadow-md shadow-primary/20">
                                        Download {res.resourceType}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResourceLibrary;
