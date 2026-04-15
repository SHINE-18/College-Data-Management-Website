import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const typeColors = {
    Journal: 'bg-blue-100 text-blue-700',
    Conference: 'bg-purple-100 text-purple-700',
    'Book Chapter': 'bg-teal-100 text-teal-700',
    Book: 'bg-green-100 text-green-700',
    Patent: 'bg-orange-100 text-orange-700'
};

const indexColors = {
    SCI: 'bg-green-100 text-green-700',
    Scopus: 'bg-blue-100 text-blue-700',
    UGC: 'bg-purple-100 text-purple-700',
    Other: 'bg-gray-100 text-gray-700'
};

const emptyForm = {
    title: '',
    journalName: '',
    publicationType: 'Journal',
    publicationYear: '',
    doi: '',
    indexingDetails: 'SCI'
};

const Publications = () => {
    const { user } = useAuth();
    const [facultyId, setFacultyId] = useState(null);
    const [pubs, setPubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingPublication, setEditingPublication] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const loadPublications = async (resolvedFacultyId) => {
        const response = await api.get(`/publications/faculty/${resolvedFacultyId}`);
        setPubs(Array.isArray(response.data) ? response.data : []);
    };

    useEffect(() => {
        const fetchPublications = async () => {
            if (!user?.email) {
                setLoading(false);
                return;
            }

            try {
                const facultyResponse = await api.get(`/faculty?search=${encodeURIComponent(user.email)}`);
                const facultyList = facultyResponse.data.data || [];
                const myProfile = facultyList.find(faculty => faculty.email === user.email);

                if (myProfile) {
                    setFacultyId(myProfile._id);
                    await loadPublications(myProfile._id);
                }
            } catch (error) {
                console.error('Failed to fetch publications', error);
                toast.error('Failed to load publications');
            } finally {
                setLoading(false);
            }
        };

        fetchPublications();
    }, [user]);

    const closeModal = () => {
        setShowModal(false);
        setEditingPublication(null);
        setForm(emptyForm);
    };

    const openAdd = () => {
        setEditingPublication(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEdit = (publication) => {
        setEditingPublication(publication);
        setForm({
            title: publication.title || '',
            journalName: publication.journalName || publication.conferenceName || publication.publisher || '',
            publicationType: publication.publicationType || 'Journal',
            publicationYear: publication.publicationDate ? String(new Date(publication.publicationDate).getFullYear()) : '',
            doi: publication.doi || '',
            indexingDetails: publication.indexingDetails || 'SCI'
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!facultyId) {
            toast.error('Faculty profile not found. Cannot save publications.');
            return;
        }

        if (!form.title || !form.journalName || !form.publicationYear) {
            toast.error('Please fill required fields: Title, Journal/Venue, and Year.');
            return;
        }

        try {
            setSaving(true);

            const payload = {
                title: form.title.trim(),
                publicationType: form.publicationType,
                publicationDate: `${form.publicationYear}-01-01`,
                doi: form.doi.trim(),
                indexingDetails: form.indexingDetails,
                isIndexed: form.indexingDetails !== 'Other'
            };

            if (form.publicationType === 'Conference') {
                payload.conferenceName = form.journalName.trim();
            } else {
                payload.journalName = form.journalName.trim();
            }

            if (editingPublication?._id) {
                await api.put(`/publications/${editingPublication._id}`, payload);
                toast.success('Publication updated!');
            } else {
                await api.post('/publications', payload);
                toast.success('Publication added!');
            }

            await loadPublications(facultyId);
            closeModal();
        } catch (error) {
            console.error('Publication save failed', error);
            toast.error(error.response?.data?.message || 'Failed to save publication');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (publicationId) => {
        if (!window.confirm('Are you sure you want to delete this publication?')) {
            return;
        }

        try {
            await api.delete(`/publications/${publicationId}`);
            toast.success('Publication deleted.');
            if (facultyId) {
                await loadPublications(facultyId);
            }
        } catch (error) {
            console.error('Publication delete failed', error);
            toast.error(error.response?.data?.message || 'Failed to delete publication');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Publications</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your research publications, patents, and book chapters.</p>
                </div>
                <button onClick={openAdd} disabled={!facultyId} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md flex items-center space-x-2 disabled:opacity-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span>Add Publication</span>
                </button>
            </div>

            {!facultyId && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm font-medium">
                    Warning: Your logged-in email does not currently match any faculty records in the public directory. Please ask the HOD to add a faculty profile for you before adding publications.
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Title</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Journal/Venue</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Year</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Index</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pubs.map((publication, index) => {
                                const venue = publication.journalName || publication.conferenceName || publication.publisher || '-';
                                const publicationYear = publication.publicationDate
                                    ? new Date(publication.publicationDate).getFullYear()
                                    : '-';

                                return (
                                    <tr key={publication._id || index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                                            <div className="truncate" title={publication.title}>{publication.title}</div>
                                            {publication.doi && (
                                                <a
                                                    href={publication.doi.startsWith('http') ? publication.doi : `https://doi.org/${publication.doi}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-accent hover:underline block mt-1 truncate"
                                                    title={publication.doi}
                                                >
                                                    DOI: {publication.doi}
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="truncate max-w-[150px]" title={venue}>{venue}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{publicationYear}</td>
                                        <td className="px-6 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${typeColors[publication.publicationType] || 'bg-gray-100 text-gray-700'}`}>{publication.publicationType}</span></td>
                                        <td className="px-6 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${indexColors[publication.indexingDetails] || 'bg-gray-100 text-gray-700'}`}>{publication.indexingDetails || 'Other'}</span></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => openEdit(publication)} className="text-accent hover:text-accent-600 text-sm font-medium">Edit</button>
                                                <button onClick={() => handleDelete(publication._id)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {pubs.length === 0 && <div className="text-center py-12 text-gray-400"><p>No publications yet.</p></div>}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editingPublication ? 'Edit' : 'Add'} Publication</h2>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Journal/Venue *</label><input value={form.journalName} onChange={e => setForm({ ...form, journalName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={form.publicationType} onChange={e => setForm({ ...form, publicationType: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white">{['Journal', 'Conference', 'Book Chapter', 'Book', 'Patent'].map(type => <option key={type}>{type}</option>)}</select></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Year *</label><input type="number" min="1900" max="2100" value={form.publicationYear} onChange={e => setForm({ ...form, publicationYear: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="2026" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">DOI / Link</label><input value={form.doi} onChange={e => setForm({ ...form, doi: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="10.xxxx/xxxxx" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Index Type</label><select value={form.indexingDetails} onChange={e => setForm({ ...form, indexingDetails: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white">{['SCI', 'Scopus', 'UGC', 'Other'].map(type => <option key={type}>{type}</option>)}</select></div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={closeModal} disabled={saving} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-md flex items-center gap-2 disabled:opacity-70">
                                {saving ? <><span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></span> Saving...</> : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Publications;
