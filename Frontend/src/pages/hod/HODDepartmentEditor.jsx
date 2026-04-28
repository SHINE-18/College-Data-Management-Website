import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

/* ─── tiny reusable helpers ─────────────────────────────────────── */
const SectionCard = ({ title, icon, children, badge }) => (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                <span className="text-lg">{icon}</span> {title}
            </h2>
            {badge && (
                <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {badge}
                </span>
            )}
        </div>
        <div className="p-6">{children}</div>
    </section>
);

const InputField = ({ label, value, onChange, placeholder, type = 'text', hint }) => (
    <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-medium text-slate-800 transition outline-none"
        />
        {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
);

const TextareaField = ({ label, value, onChange, placeholder, rows = 4, hint }) => (
    <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">{label}</label>
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-medium text-slate-800 transition outline-none resize-y"
        />
        {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
);

/* ─── main page ─────────────────────────────────────────────────── */
const HODDepartmentEditor = () => {
    const { user } = useAuth();
    const [dept, setDept] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');

    // ── form state ──────────────────────────────────────────────────
    const [description, setDescription] = useState('');
    const [detailAbout, setDetailAbout] = useState('');
    const [vision, setVision] = useState('');
    const [mission, setMission] = useState('');
    const [hodMessage, setHodMessage] = useState('');
    const [hodVideoUrl, setHodVideoUrl] = useState('');

    // arrays
    const [achievements, setAchievements] = useState([]);
    const [researchAreas, setResearchAreas] = useState([]);
    const [stats, setStats] = useState([]);

    // placement records (separate model)
    const [placements, setPlacements] = useState([]);
    const [placementLoading, setPlacementLoading] = useState(false);
    const [newPlacement, setNewPlacement] = useState({
        companyName: '', package: '', studentsPlaced: '',
        year: new Date().getFullYear(), type: 'on-campus', logoUrl: ''
    });

    /* ── fetch department ─────────────────────────────────────── */
    useEffect(() => {
        const fetchDept = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/departments/search?name=${encodeURIComponent(user?.department || '')}`);
                const d = res.data.data;
                setDept(d);

                setDescription(d.description || '');
                setDetailAbout(d.detailAbout || '');
                setVision(d.vision || '');
                setMission(d.mission || '');
                setHodMessage(d.hod?.message || '');
                setHodVideoUrl(d.hod?.videoUrl || '');
                setAchievements(d.achievements?.length ? d.achievements : ['']);
                setResearchAreas(d.researchAreas?.length ? d.researchAreas : [{ title: '', faculty: '', projects: '', courses: '' }]);
                setStats(d.stats?.length ? d.stats : [{ val: '', label: '' }]);
            } catch (err) {
                toast.error('Could not load department data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user?.department) fetchDept();
    }, [user?.department]);

    /* ── fetch placements ─────────────────────────────────────── */
    useEffect(() => {
        if (!user?.department) return;
        const fetchPlacements = async () => {
            setPlacementLoading(true);
            try {
                const res = await api.get(`/placements?department=${encodeURIComponent(user.department)}`);
                setPlacements(Array.isArray(res.data) ? res.data : []);
            } catch {
                setPlacements([]);
            } finally {
                setPlacementLoading(false);
            }
        };
        fetchPlacements();
    }, [user?.department]);

    /* ── save overview / content ─────────────────────────────── */
    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put('/departments/my', {
                description,
                detailAbout,
                vision,
                mission,
                hod_message: hodMessage,
                hod_videoUrl: hodVideoUrl,
                achievements: achievements.filter(a => a.trim()),
                researchAreas: researchAreas.filter(r => r.title?.trim()),
                stats: stats.filter(s => s.val?.trim() && s.label?.trim()),
            });
            toast.success('Department page updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save changes.');
        } finally {
            setSaving(false);
        }
    };

    /* ── handle placement add ────────────────────────────────── */
    const handleAddPlacement = async () => {
        if (!newPlacement.companyName || !newPlacement.package || !newPlacement.studentsPlaced) {
            toast.error('Company name, package, and students placed are required.');
            return;
        }
        try {
            const res = await api.post('/placements', {
                ...newPlacement,
                package: Number(newPlacement.package),
                studentsPlaced: Number(newPlacement.studentsPlaced),
                year: Number(newPlacement.year),
                department: user.department,
            });
            setPlacements(prev => [res.data, ...prev]);
            setNewPlacement({ companyName: '', package: '', studentsPlaced: '', year: new Date().getFullYear(), type: 'on-campus', logoUrl: '' });
            toast.success('Placement record added!');
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to add placement.');
        }
    };

    /* ── handle placement delete ─────────────────────────────── */
    const handleDeletePlacement = async (id) => {
        if (!window.confirm('Delete this placement record?')) return;
        try {
            await api.delete(`/placements/${id}`);
            setPlacements(prev => prev.filter(p => p._id !== id));
            toast.success('Placement record deleted.');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete.');
        }
    };

    /* ── array field helpers ─────────────────────────────────── */
    const addAchievement = () => setAchievements(prev => [...prev, '']);
    const removeAchievement = (i) => setAchievements(prev => prev.filter((_, idx) => idx !== i));
    const updateAchievement = (i, val) => setAchievements(prev => prev.map((a, idx) => idx === i ? val : a));

    const addResearchArea = () => setResearchAreas(prev => [...prev, { title: '', faculty: '', projects: '', courses: '' }]);
    const removeResearchArea = (i) => setResearchAreas(prev => prev.filter((_, idx) => idx !== i));
    const updateResearchArea = (i, field, val) => setResearchAreas(prev =>
        prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r)
    );

    const addStat = () => setStats(prev => [...prev, { val: '', label: '' }]);
    const removeStat = (i) => setStats(prev => prev.filter((_, idx) => idx !== i));
    const updateStat = (i, field, val) => setStats(prev =>
        prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s)
    );

    /* ── UI ─────────────────────────────────────────────────── */
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!dept) {
        return (
            <div className="text-center py-20 text-slate-500">
                <p className="text-lg font-medium">Department record not found.</p>
                <p className="text-sm mt-1">Contact the super-admin to create your department in the system.</p>
            </div>
        );
    }

    const SECTIONS = [
        { id: 'overview', label: 'Overview', icon: '🏠' },
        { id: 'hod', label: 'HOD Message', icon: '🎓' },
        { id: 'vision', label: 'Vision & Mission', icon: '🔭' },
        { id: 'stats', label: 'Key Stats', icon: '📊' },
        { id: 'research', label: 'Research Areas', icon: '🔬' },
        { id: 'achievements', label: 'Achievements', icon: '🏆' },
        { id: 'placements', label: 'Placements', icon: '💼' },
    ];

    return (
        <div className="animate-fade-in space-y-6">
            {/* ── Header ─── */}
            <div className="bg-gradient-to-r from-primary-700 to-primary rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-black">Department Page Editor</h1>
                    <p className="text-primary-100 mt-1 text-sm">
                        Editing: <span className="font-bold text-white">{dept.name}</span> — all changes appear live on the public department page.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || activeSection === 'placements'}
                    className="flex items-center gap-2 bg-white text-primary px-6 py-2.5 rounded-xl font-black text-sm hover:bg-slate-50 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>
                            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                            Saving…
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* ── Section Tabs ─── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-1.5 flex flex-wrap gap-1">
                {SECTIONS.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition ${
                            activeSection === s.id
                                ? 'bg-primary text-white shadow-md shadow-primary/30'
                                : 'text-slate-600 hover:bg-slate-50'
                        }`}
                    >
                        <span>{s.icon}</span> {s.label}
                    </button>
                ))}
            </div>

            {/* ══ OVERVIEW ══ */}
            {activeSection === 'overview' && (
                <SectionCard title="Overview Text" icon="🏠" badge="Public Page Hero">
                    <div className="space-y-5">
                        <TextareaField
                            label="Short Description (shown in hero banner)"
                            value={description}
                            onChange={setDescription}
                            placeholder="A one-line tagline for your department shown in the hero section…"
                            rows={2}
                        />
                        <TextareaField
                            label="Detailed About Section"
                            value={detailAbout}
                            onChange={setDetailAbout}
                            placeholder="A rich paragraph describing the department's history, approach and offerings…"
                            rows={6}
                        />
                    </div>
                </SectionCard>
            )}

            {/* ══ HOD MESSAGE ══ */}
            {activeSection === 'hod' && (
                <SectionCard title="HOD Message & Video" icon="🎓" badge="From the HOD">
                    <div className="space-y-5">
                        <TextareaField
                            label="HOD Welcome Message"
                            value={hodMessage}
                            onChange={setHodMessage}
                            placeholder="Write a welcoming message that will be shown on the department page below your photo…"
                            rows={5}
                            hint="This appears as a quote on the public department page."
                        />
                        <InputField
                            label="YouTube Video Embed URL (optional)"
                            value={hodVideoUrl}
                            onChange={setHodVideoUrl}
                            placeholder="https://www.youtube-nocookie.com/embed/VIDEO_ID"
                            hint="Paste the embed URL from YouTube (Share → Embed → copy the src URL). Leave blank to hide the video."
                        />
                        {hodVideoUrl && (
                            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center py-2 bg-slate-800">
                                    Video Preview
                                </p>
                                <div className="relative w-full pt-[56.25%]">
                                    <iframe
                                        className="absolute inset-0 w-full h-full"
                                        src={hodVideoUrl}
                                        title="HOD Video Preview"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </SectionCard>
            )}

            {/* ══ VISION & MISSION ══ */}
            {activeSection === 'vision' && (
                <SectionCard title="Vision & Mission" icon="🔭">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <TextareaField
                            label="Vision"
                            value={vision}
                            onChange={setVision}
                            placeholder="To be a global leader in engineering…"
                            rows={5}
                        />
                        <TextareaField
                            label="Mission"
                            value={mission}
                            onChange={setMission}
                            placeholder="To provide world-class education…"
                            rows={5}
                        />
                    </div>
                </SectionCard>
            )}

            {/* ══ KEY STATS ══ */}
            {activeSection === 'stats' && (
                <SectionCard title="Key Stats (Hero Banner)" icon="📊" badge="Up to 4 stats">
                    <div className="space-y-3">
                        {stats.map((s, i) => (
                            <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-3 items-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <InputField label="Value" value={s.val} onChange={v => updateStat(i, 'val', v)} placeholder="22" />
                                <InputField label="Label" value={s.label} onChange={v => updateStat(i, 'label', v)} placeholder="Faculty Members" />
                                <button onClick={() => removeStat(i)}
                                    className="mt-5 p-2 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {stats.length < 4 && (
                            <button onClick={addStat}
                                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-bold hover:border-primary hover:text-primary transition">
                                + Add Stat
                            </button>
                        )}
                    </div>
                </SectionCard>
            )}

            {/* ══ RESEARCH AREAS ══ */}
            {activeSection === 'research' && (
                <SectionCard title="Research Areas" icon="🔬">
                    <div className="space-y-4">
                        {researchAreas.map((r, i) => (
                            <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Area #{i + 1}</span>
                                    <button onClick={() => removeResearchArea(i)}
                                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <InputField label="Area Title" value={r.title} onChange={v => updateResearchArea(i, 'title', v)} placeholder="Artificial Intelligence & Machine Learning" />
                                <div className="grid grid-cols-3 gap-3">
                                    <InputField label="Faculty" value={r.faculty} onChange={v => updateResearchArea(i, 'faculty', v)} placeholder="4" type="number" />
                                    <InputField label="Projects" value={r.projects} onChange={v => updateResearchArea(i, 'projects', v)} placeholder="12" type="number" />
                                    <InputField label="Courses" value={r.courses} onChange={v => updateResearchArea(i, 'courses', v)} placeholder="6" type="number" />
                                </div>
                            </div>
                        ))}
                        <button onClick={addResearchArea}
                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-bold hover:border-primary hover:text-primary transition">
                            + Add Research Area
                        </button>
                    </div>
                </SectionCard>
            )}

            {/* ══ ACHIEVEMENTS ══ */}
            {activeSection === 'achievements' && (
                <SectionCard title="Departmental Achievements / Milestones" icon="🏆">
                    <div className="space-y-3">
                        {achievements.map((a, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={a}
                                    onChange={e => updateAchievement(i, e.target.value)}
                                    placeholder={`Achievement #${i + 1}`}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm font-medium text-slate-800 transition outline-none"
                                />
                                <button onClick={() => removeAchievement(i)}
                                    className="p-2.5 rounded-xl text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition shrink-0">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <button onClick={addAchievement}
                            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-bold hover:border-primary hover:text-primary transition">
                            + Add Achievement
                        </button>
                    </div>
                </SectionCard>
            )}

            {/* ══ PLACEMENTS ══ */}
            {activeSection === 'placements' && (
                <div className="space-y-6">
                    {/* Add new placement */}
                    <SectionCard title="Add Placement Record" icon="💼" badge="New Entry">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InputField label="Company Name *" value={newPlacement.companyName}
                                onChange={v => setNewPlacement(p => ({ ...p, companyName: v }))}
                                placeholder="e.g. Google India" />
                            <InputField label="Package (LPA) *" value={newPlacement.package} type="number"
                                onChange={v => setNewPlacement(p => ({ ...p, package: v }))}
                                placeholder="12" />
                            <InputField label="Students Placed *" value={newPlacement.studentsPlaced} type="number"
                                onChange={v => setNewPlacement(p => ({ ...p, studentsPlaced: v }))}
                                placeholder="20" />
                            <InputField label="Year *" value={newPlacement.year} type="number"
                                onChange={v => setNewPlacement(p => ({ ...p, year: v }))}
                                placeholder={new Date().getFullYear()} />
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">Type</label>
                                <select
                                    value={newPlacement.type}
                                    onChange={e => setNewPlacement(p => ({ ...p, type: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary text-sm font-medium text-slate-800 transition outline-none"
                                >
                                    <option value="on-campus">On-Campus</option>
                                    <option value="off-campus">Off-Campus</option>
                                </select>
                            </div>
                            <InputField label="Logo URL (optional)" value={newPlacement.logoUrl}
                                onChange={v => setNewPlacement(p => ({ ...p, logoUrl: v }))}
                                placeholder="https://logo.clearbit.com/google.com" />
                        </div>
                        <button
                            onClick={handleAddPlacement}
                            className="mt-5 flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-700 transition shadow-md shadow-primary/20"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Record
                        </button>
                    </SectionCard>

                    {/* Existing placements */}
                    <SectionCard title="Placement Records" icon="📋">
                        {placementLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />)}
                            </div>
                        ) : placements.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                                <p className="text-lg">📭 No placement records yet.</p>
                                <p className="text-sm mt-1">Use the form above to add your first entry.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            {['Company', 'Package (LPA)', 'Students', 'Year', 'Type', ''].map(h => (
                                                <th key={h} className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {placements.map(p => (
                                            <tr key={p._id} className="hover:bg-slate-50 transition rounded-xl">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        {p.logoUrl && (
                                                            <img src={p.logoUrl} alt="" className="w-7 h-7 object-contain rounded"
                                                                onError={e => { e.target.style.display = 'none'; }} />
                                                        )}
                                                        <span className="font-bold text-slate-800">{p.companyName}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 font-bold text-emerald-600">{p.package} LPA</td>
                                                <td className="py-3 px-4 font-medium text-slate-600">{p.studentsPlaced}</td>
                                                <td className="py-3 px-4 font-medium text-slate-600">{p.year}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                                        p.type === 'on-campus' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-700'
                                                    }`}>{p.type}</span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button onClick={() => handleDeletePlacement(p._id)}
                                                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </SectionCard>

                    {/* Placement summary preview */}
                    {placements.length > 0 && (
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Public Page Preview — Placement Stats</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {placements.slice(0, 8).map(p => (
                                    <div key={p._id} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition">
                                        {p.logoUrl && (
                                            <img src={p.logoUrl} alt={p.companyName} className="w-8 h-8 object-contain mx-auto mb-2 opacity-80"
                                                onError={e => { e.target.style.display = 'none'; }} />
                                        )}
                                        <p className="text-xl font-black text-white">{p.studentsPlaced}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 leading-tight">{p.companyName}</p>
                                        <p className="text-[10px] text-emerald-400 font-bold mt-0.5">{p.package} LPA</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Save button at bottom ─── */}
            {activeSection !== 'placements' && (
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-black text-sm hover:bg-primary-700 transition shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : '✓ Save All Changes'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default HODDepartmentEditor;
