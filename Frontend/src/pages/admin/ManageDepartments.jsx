import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';
import campusMap from '../../assets/campusmap.png';

/* ─────────────────────────────── helpers ─────────────────────────────── */

const HOD_OPTIONS = [
    'Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Suresh Patel',
    'Dr. Anita Singh', 'Dr. Vikram Reddy', 'Dr. Meena Gupta',
    'Dr. Sneha Verma', 'Dr. Pooja Mehta', 'Dr. A. K. Shah',
    'Prof. Kajal S. Patel', 'Dr. V. P. Patel',
];

const EMPTY_FORM = {
    name: '', code: '', established: '',
    description: '', hod: '',
    mapCoordinates: { points: '', color: '#3b82f6', showOnMap: false },
};

const TABS = ['departments', 'map-editor'];

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Map Coordinate Editor sub-component                                   */
/* ═══════════════════════════════════════════════════════════════════════ */
const MapEditor = ({ dept, onSave, onClose }) => {
    const imgRef = useRef(null);
    const svgRef = useRef(null);
    const [points, setPoints] = useState(
        dept.mapCoordinates?.points
            ? dept.mapCoordinates.points.trim().split(/[\s,]+/).reduce((acc, v, i, a) => {
                if (i % 2 === 0 && a[i + 1] !== undefined) acc.push({ x: Number(v), y: Number(a[i + 1]) });
                return acc;
            }, [])
            : []
    );
    const [color, setColor] = useState(dept.mapCoordinates?.color || '#3b82f6');
    const [showOnMap, setShowOnMap] = useState(dept.mapCoordinates?.showOnMap ?? false);
    const [imgSize, setImgSize] = useState({ w: 1, h: 1 }); // natural dimensions
    const [mode, setMode] = useState('add'); // 'add' | 'move' | 'delete'
    const [dragging, setDragging] = useState(null); // index of point being dragged

    const VIEWBOX = 2000; // matches InteractiveMap viewBox

    useEffect(() => {
        if (imgRef.current?.complete) {
            setImgSize({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
        }
    }, []);

    const svgCoords = (e) => {
        const rect = svgRef.current.getBoundingClientRect();
        const scaleX = VIEWBOX / rect.width;
        const scaleY = VIEWBOX / rect.height;
        return {
            x: Math.round((e.clientX - rect.left) * scaleX),
            y: Math.round((e.clientY - rect.top) * scaleY),
        };
    };

    const handleSvgClick = (e) => {
        if (mode !== 'add') return;
        setPoints(prev => [...prev, svgCoords(e)]);
    };

    const handlePointClick = (e, idx) => {
        e.stopPropagation();
        if (mode === 'delete') setPoints(prev => prev.filter((_, i) => i !== idx));
    };

    const handleMouseDown = (e, idx) => {
        if (mode !== 'move') return;
        e.stopPropagation();
        setDragging(idx);
    };

    const handleMouseMove = (e) => {
        if (dragging === null || mode !== 'move') return;
        const c = svgCoords(e);
        setPoints(prev => prev.map((p, i) => i === dragging ? c : p));
    };

    const handleMouseUp = () => setDragging(null);

    const pointsStr = points.map(p => `${p.x},${p.y}`).join(',');

    const handleSave = () => {
        onSave({ points: pointsStr, color, showOnMap });
    };

    const modeBtn = (m, label, icon) => (
        <button
            onClick={() => setMode(m)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${mode === m ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
            <span>{icon}</span><span>{label}</span>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-5xl max-h-[95vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Map Coordinate Editor</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            <span className="font-semibold text-blue-600">{dept.name}</span>
                            &nbsp;— click on the map to place polygon points
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: map canvas */}
                    <div className="flex-1 overflow-auto bg-slate-900 relative">
                        <svg
                            ref={svgRef}
                            className="w-full h-full cursor-crosshair select-none"
                            viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
                            preserveAspectRatio="xMidYMid meet"
                            onClick={handleSvgClick}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <image
                                ref={imgRef}
                                href={campusMap}
                                x="0" y="0"
                                width={VIEWBOX} height={VIEWBOX}
                                preserveAspectRatio="xMidYMid meet"
                                onLoad={e => setImgSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
                            />
                            {/* Polygon fill preview */}
                            {points.length >= 3 && (
                                <polygon
                                    points={pointsStr}
                                    fill={color + '55'}
                                    stroke={color}
                                    strokeWidth="6"
                                />
                            )}
                            {/* Lines between points */}
                            {points.length >= 2 && (
                                <polyline
                                    points={pointsStr}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="4"
                                    strokeDasharray="10 6"
                                />
                            )}
                            {/* Point handles */}
                            {points.map((p, i) => (
                                <g key={i}>
                                    <circle
                                        cx={p.x} cy={p.y} r="20"
                                        fill={mode === 'delete' ? '#ef444480' : '#fff8'}
                                        stroke={mode === 'delete' ? '#ef4444' : color}
                                        strokeWidth="5"
                                        className={mode === 'move' ? 'cursor-grab' : mode === 'delete' ? 'cursor-pointer' : ''}
                                        onClick={e => handlePointClick(e, i)}
                                        onMouseDown={e => handleMouseDown(e, i)}
                                    />
                                    <text x={p.x} y={p.y + 7} textAnchor="middle" fontSize="22" fill={color} fontWeight="bold">{i + 1}</text>
                                </g>
                            ))}
                        </svg>
                    </div>

                    {/* Right: controls */}
                    <div className="w-72 border-l border-gray-100 flex flex-col bg-gray-50 overflow-y-auto">
                        <div className="p-4 space-y-5">
                            {/* Mode selector */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Edit Mode</p>
                                <div className="flex flex-wrap gap-2">
                                    {modeBtn('add', 'Add Points', '➕')}
                                    {modeBtn('move', 'Move', '✋')}
                                    {modeBtn('delete', 'Delete', '🗑️')}
                                </div>
                            </div>

                            {/* Color picker */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Highlight Color</p>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={e => setColor(e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                                    />
                                    <span className="text-sm font-mono text-gray-600">{color}</span>
                                </div>
                            </div>

                            {/* Show on map toggle */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Visibility</p>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <div
                                        onClick={() => setShowOnMap(v => !v)}
                                        className={`relative w-11 h-6 rounded-full transition-colors ${showOnMap ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showOnMap ? 'translate-x-5' : ''}`} />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-700">
                                        {showOnMap ? 'Visible on map' : 'Hidden from map'}
                                    </span>
                                </label>
                            </div>

                            {/* Raw points */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Raw Points ({points.length} pts)</p>
                                <textarea
                                    className="w-full text-[11px] font-mono bg-white border border-gray-200 rounded-lg p-2 resize-none text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    rows={5}
                                    value={pointsStr}
                                    onChange={e => {
                                        const raw = e.target.value;
                                        const nums = raw.trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
                                        const pts = [];
                                        for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: nums[i], y: nums[i + 1] });
                                        setPoints(pts);
                                    }}
                                    placeholder="x1,y1,x2,y2,..."
                                />
                                <p className="text-[10px] text-gray-400 mt-1">You can also paste coordinates directly from image-map.net</p>
                            </div>

                            {/* Actions */}
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Actions</p>
                                <button
                                    onClick={() => setPoints([])}
                                    className="w-full px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition mb-2"
                                >
                                    Clear All Points
                                </button>
                            </div>
                        </div>

                        {/* Footer save */}
                        <div className="p-4 border-t border-gray-100 mt-auto">
                            <button
                                onClick={handleSave}
                                disabled={points.length < 3 && showOnMap}
                                className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow"
                            >
                                Save Map Coordinates
                            </button>
                            {points.length < 3 && showOnMap && (
                                <p className="text-[10px] text-red-400 mt-1.5 text-center">Add at least 3 points to show on map</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Add Department modal                                                   */
/* ═══════════════════════════════════════════════════════════════════════ */
const AddDeptModal = ({ onClose, onSaved }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleSave = async () => {
        if (!form.name || !form.code || !form.established) {
            toast.error('Fill all required fields.');
            return;
        }
        setSaving(true);
        try {
            await api.post('/departments', {
                name: form.name,
                code: form.code.toUpperCase(),
                established: Number(form.established),
                description: form.description,
                hod: form.hod ? { name: form.hod, message: '' } : undefined,
                mapCoordinates: form.mapCoordinates,
            });
            toast.success('Department added!');
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add department');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-gray-900">Add New Department</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Department Name <span className="text-red-500">*</span></label>
                            <input
                                value={form.name} onChange={e => set('name', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                placeholder="e.g. Biomedical Engineering"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Code <span className="text-red-500">*</span></label>
                            <input
                                value={form.code} onChange={e => set('code', e.target.value.toUpperCase())}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none uppercase"
                                placeholder="e.g. BME"
                                maxLength={10}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Established Year <span className="text-red-500">*</span></label>
                            <input
                                type="number" value={form.established} onChange={e => set('established', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                                placeholder="e.g. 2020"
                                min={1900} max={2100}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Short Description</label>
                            <textarea
                                value={form.description} onChange={e => set('description', e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                                placeholder="Brief dept description..."
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Assign HOD</label>
                            <select
                                value={form.hod} onChange={e => set('hod', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white"
                            >
                                <option value="">— Select HOD —</option>
                                {HOD_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    </div>

                    <p className="text-[11px] text-gray-400 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                        💡 Map coordinates can be set after creation using the <strong>Map Editor</strong> on each department row.
                    </p>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                    <button
                        onClick={handleSave} disabled={saving}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-60"
                    >
                        {saving ? 'Saving…' : 'Add Department'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Map Preview Tab                                                       */
/* ═══════════════════════════════════════════════════════════════════════ */
const MapPreviewTab = ({ depts }) => {
    const [hovered, setHovered] = useState(null);
    const VIEWBOX = 2000;

    const mapped = depts.filter(d => d.mapCoordinates?.showOnMap && d.mapCoordinates?.points);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Live Map Preview</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{mapped.length} department{mapped.length !== 1 ? 's' : ''} visible on the interactive campus map</p>
                </div>
                {mapped.length === 0 && (
                    <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full">No depts on map yet</span>
                )}
            </div>

            <div className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-slate-100 select-none">
                <img src={campusMap} alt="Campus Map" className="w-full h-auto pointer-events-none" />
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
                    preserveAspectRatio="xMidYMid slice"
                >
                    {mapped.map(d => (
                        <g key={d._id || d.code}
                            onMouseEnter={() => setHovered(d)}
                            onMouseLeave={() => setHovered(null)}
                            className="cursor-pointer"
                        >
                            <polygon
                                points={d.mapCoordinates.points}
                                fill={hovered?._id === d._id
                                    ? (d.mapCoordinates.color || '#3b82f6') + '55'
                                    : (d.mapCoordinates.color || '#3b82f6') + '22'}
                                stroke={d.mapCoordinates.color || '#3b82f6'}
                                strokeWidth={hovered?._id === d._id ? 8 : 4}
                                className="transition-all duration-200"
                            />
                        </g>
                    ))}
                </svg>
            </div>

            {/* Legend */}
            {mapped.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {mapped.map(d => (
                        <span key={d._id || d.code} className="flex items-center space-x-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-100 rounded-full px-3 py-1 shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: d.mapCoordinates.color || '#3b82f6' }} />
                            <span>{d.code}</span>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Main ManageDepartments page                                           */
/* ═══════════════════════════════════════════════════════════════════════ */
const ManageDepartments = () => {
    const [depts, setDepts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('departments');
    const [showAddModal, setShowAddModal] = useState(false);
    const [mapEditorDept, setMapEditorDept] = useState(null); // dept being edited in map editor

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/departments');
            setDepts(res.data.data || []);
        } catch {
            toast.error('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDepartments(); }, []);

    /* ── HOD assign ── */
    const assignHod = async (id, hodName) => {
        try {
            await api.put(`/departments/${id}`, { hod: { name: hodName, message: '' } });
            toast.success('HOD assigned!');
            fetchDepartments();
        } catch {
            toast.error('Failed to assign HOD');
        }
    };

    /* ── Remove (soft-delete) ── */
    const removeDept = async (id, name) => {
        if (!window.confirm(`Remove "${name}" from the system? This will also hide it from the campus map.`)) return;
        try {
            await api.delete(`/departments/${id}`);
            toast.success('Department removed');
            fetchDepartments();
        } catch {
            toast.error('Failed to remove department');
        }
    };

    /* ── Save map coordinates ── */
    const saveMapCoords = async (dept, coords) => {
        try {
            await api.put(`/departments/${dept._id}`, { mapCoordinates: coords });
            toast.success(`Map updated for ${dept.name}`);
            setMapEditorDept(null);
            fetchDepartments();
        } catch {
            toast.error('Failed to save map coordinates');
        }
    };

    /* ── Toggle visibility on map ── */
    const toggleMapVisibility = async (dept) => {
        try {
            const newVal = !dept.mapCoordinates?.showOnMap;
            await api.put(`/departments/${dept._id}`, {
                mapCoordinates: { ...dept.mapCoordinates, showOnMap: newVal },
            });
            toast.success(newVal ? `${dept.code} shown on map` : `${dept.code} hidden from map`);
            fetchDepartments();
        } catch {
            toast.error('Failed to update visibility');
        }
    };

    /* ━━━━━━━━━━━━━━━━━━━━━━ render ━━━━━━━━━━━━━━━━━━━━━━ */
    return (
        <div className="animate-fade-in space-y-6">

            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Departments</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Add departments, set HODs, and configure their interactive map position.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-md flex items-center space-x-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Department</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                {[
                    { key: 'departments', label: '🏗️ Departments', },
                    { key: 'map-editor', label: '🗺️ Map Preview', },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t.key ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── DEPARTMENTS TAB ── */}
            {activeTab === 'departments' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Department</th>
                                <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Code</th>
                                <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Est.</th>
                                <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">HOD</th>
                                <th className="text-center px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">On Map</th>
                                <th className="text-right px-5 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <span>Loading departments…</span>
                                    </div>
                                </td></tr>
                            ) : depts.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No departments found.</td></tr>
                            ) : depts.map((d, i) => (
                                <tr key={d._id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} hover:bg-blue-50/40 transition border-b border-gray-100 last:border-0`}>
                                    {/* Name */}
                                    <td className="px-5 py-3">
                                        <div className="flex items-center space-x-2.5">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                style={{ background: d.mapCoordinates?.color || '#94a3b8' }}
                                            />
                                            <span className="font-semibold text-gray-800">{d.name}</span>
                                        </div>
                                    </td>

                                    {/* Code */}
                                    <td className="px-5 py-3">
                                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">{d.code}</span>
                                    </td>

                                    {/* Established */}
                                    <td className="px-5 py-3 text-gray-500">{d.established}</td>

                                    {/* HOD */}
                                    <td className="px-5 py-3">
                                        <select
                                            value={d.hod?.name || 'Unassigned'}
                                            onChange={e => assignHod(d._id, e.target.value)}
                                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-blue-400 outline-none max-w-[180px]"
                                        >
                                            <option value="Unassigned">— Assign HOD —</option>
                                            {HOD_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                    </td>

                                    {/* On Map toggle */}
                                    <td className="px-5 py-3 text-center">
                                        <div className="flex flex-col items-center space-y-1">
                                            <div
                                                onClick={() => toggleMapVisibility(d)}
                                                title={d.mapCoordinates?.points ? 'Toggle map visibility' : 'Set coordinates first via Map Editor'}
                                                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${d.mapCoordinates?.showOnMap ? 'bg-blue-600' : 'bg-gray-300'} ${!d.mapCoordinates?.points ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            >
                                                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${d.mapCoordinates?.showOnMap ? 'translate-x-5' : ''}`} />
                                            </div>
                                            {!d.mapCoordinates?.points && (
                                                <span className="text-[9px] text-gray-400">No coords</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-5 py-3">
                                        <div className="flex items-center justify-end space-x-2">
                                            {/* Map editor button */}
                                            <button
                                                onClick={() => setMapEditorDept(d)}
                                                title="Edit map coordinates"
                                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition text-xs font-semibold"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                                </svg>
                                                <span>Map</span>
                                            </button>

                                            {/* Delete button */}
                                            <button
                                                onClick={() => removeDept(d._id, d.name)}
                                                title="Remove department"
                                                className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Summary */}
                    {!loading && depts.length > 0 && (
                        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-400">{depts.length} department{depts.length !== 1 ? 's' : ''} active</span>
                            <span className="text-xs text-gray-400">
                                {depts.filter(d => d.mapCoordinates?.showOnMap).length} on campus map
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* ── MAP PREVIEW TAB ── */}
            {activeTab === 'map-editor' && <MapPreviewTab depts={depts} />}

            {/* ── ADD DEPT MODAL ── */}
            {showAddModal && (
                <AddDeptModal onClose={() => setShowAddModal(false)} onSaved={fetchDepartments} />
            )}

            {/* ── MAP EDITOR MODAL ── */}
            {mapEditorDept && (
                <MapEditor
                    dept={mapEditorDept}
                    onSave={coords => saveMapCoords(mapEditorDept, coords)}
                    onClose={() => setMapEditorDept(null)}
                />
            )}
        </div>
    );
};

export default ManageDepartments;
