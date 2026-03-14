import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';

const typeColors = { Journal: 'bg-blue-100 text-blue-700', Conference: 'bg-purple-100 text-purple-700', Book: 'bg-green-100 text-green-700', Patent: 'bg-orange-100 text-orange-700' };
const indexColors = { SCI: 'bg-green-100 text-green-700', Scopus: 'bg-blue-100 text-blue-700', UGC: 'bg-purple-100 text-purple-700', Other: 'bg-gray-100 text-gray-700' };

const emptyForm = { title: '', journal: '', issn: '', year: '', type: 'Journal', indexType: 'SCI', doi: '' };

const Publications = () => {
    const { user } = useAuth();
    const [facultyId, setFacultyId] = useState(null);
    const [pubs, setPubs] = useState([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        const fetchPublications = async () => {
            if (!user?.email) return;
            try {
                const response = await api.get(`/faculty?search=${encodeURIComponent(user.email)}`);
                const facultyList = response.data.data;

                if (facultyList && facultyList.length > 0) {
                    const myProfile = facultyList.find(f => f.email === user.email);
                    if (myProfile) {
                        setFacultyId(myProfile._id);
                        // Map the backend structure to the frontend structure if needed
                        // The backend schema currently has: title, journal, year, link (which maps to 'doi')
                        // We will adapt the form to save everything we need.
                        setPubs(myProfile.publications || []);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch publications", error);
                toast.error("Failed to load publications");
            } finally {
                setLoading(false);
            }
        };
        fetchPublications();
    }, [user]);

    const openAdd = () => { setForm(emptyForm); setEditIndex(null); setShowModal(true); };

    const openEdit = (p, index) => {
        setForm({
            title: p.title || '',
            journal: p.journal || '',
            issn: p.issn || '',
            year: p.year || '',
            type: p.type || 'Journal',
            indexType: p.indexType || 'SCI',
            doi: p.doi || p.link || ''
        });
        setEditIndex(index);
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditIndex(null); setForm(emptyForm); };

    const updateBackend = async (newPubsArray, successMessage) => {
        if (!facultyId) {
            toast.error("Faculty profile not found. Cannot save changes.");
            return;
        }

        try {
            setSaving(true);
            // Before saving, ensure we map 'doi' back to 'link' for the backend schema
            const backendPubs = newPubsArray.map(p => ({
                ...p,
                link: p.doi || p.link
            }));

            await api.put(`/faculty/${facultyId}`, { publications: backendPubs });
            setPubs(newPubsArray);
            toast.success(successMessage);
            closeModal();
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    const handleSave = () => {
        if (!form.title || !form.journal || !form.year) {
            toast.error('Please fill required fields: Title, Journal/Venue, and Year.');
            return;
        }

        let updatedPubs = [...pubs];

        if (editIndex !== null) {
            updatedPubs[editIndex] = { ...updatedPubs[editIndex], ...form };
            updateBackend(updatedPubs, 'Publication updated!');
        } else {
            updatedPubs.push({ ...form });
            updateBackend(updatedPubs, 'Publication added!');
        }
    };

    const handleDelete = (index) => {
        if (window.confirm("Are you sure you want to delete this publication?")) {
            const updatedPubs = pubs.filter((_, i) => i !== index);
            updateBackend(updatedPubs, 'Publication deleted.');
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

            {!facultyId && !loading && (
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
                            {pubs.map((p, i) => {
                                const doiOrLink = p.doi || p.link;
                                return (
                                    <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                                            <div className="truncate" title={p.title}>{p.title}</div>
                                            {doiOrLink && <a href={doiOrLink.startsWith('10.') ? `https://doi.org/${doiOrLink}` : doiOrLink} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline block mt-1 truncate" title={doiOrLink}>Link/DOI: {doiOrLink}</a>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="truncate max-w-[150px]" title={p.journal}>{p.journal}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{p.year}</td>
                                        <td className="px-6 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${typeColors[p.type || 'Journal'] || 'bg-gray-100 text-gray-700'}`}>{p.type || 'Journal'}</span></td>
                                        <td className="px-6 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${indexColors[p.indexType || 'SCI'] || 'bg-gray-100 text-gray-700'}`}>{p.indexType || 'SCI'}</span></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <button onClick={() => openEdit(p, i)} className="text-accent hover:text-accent-600 text-sm font-medium">Edit</button>
                                                <button onClick={() => handleDelete(i)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {pubs.length === 0 && <div className="text-center py-12 text-gray-400"><p>No publications yet.</p></div>}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editIndex !== null ? 'Edit' : 'Add'} Publication</h2>
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Journal/Venue *</label><input value={form.journal} onChange={e => setForm({ ...form, journal: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">ISSN</label><input value={form.issn} onChange={e => setForm({ ...form, issn: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="Optional" /></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Year *</label><input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="2024" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white">{['Journal', 'Conference', 'Book', 'Patent'].map(t => <option key={t}>{t}</option>)}</select></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Index Type</label><select value={form.indexType} onChange={e => setForm({ ...form, indexType: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white">{['SCI', 'Scopus', 'UGC', 'Other'].map(t => <option key={t}>{t}</option>)}</select></div>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">DOI / Link</label><input value={form.doi} onChange={e => setForm({ ...form, doi: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="10.xxxx/xxxxx or URL" /></div>
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
