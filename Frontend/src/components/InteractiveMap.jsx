import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import campusMap from '../assets/campusmap.png';
import vgecLogo from '../assets/vgec_hd.png';
import api from '../utils/axios';

/**
 * InteractiveMap – Dynamic campus navigator.
 *
 * Department polygons are loaded from the /departments API.
 * Each department's mapCoordinates.points field holds the SVG polygon string.
 * Departments with showOnMap: false are not rendered.
 *
 * Non-department buildings (library, admin block) are kept as static entries
 * since they don't need portal links and aren't managed as departments.
 *
 * To update coordinates for a department: use Admin → Manage Departments → Map Editor.
 */

/** Static buildings that are NOT departments (no portal page) */
const STATIC_BUILDINGS = [
    {
        id: 'library',
        name: 'VGEC Central Library',
        points: '1131,80,1077,356,1375,418,1432,162',
        description: 'Resource center and quiet study areas.',
        isDepartment: false,
        color: '#f59e0b',
    },
    {
        id: 'admin-block',
        name: 'Administrative Block',
        points: '1333,1406,1651,1344,1685,1679,1359,1698',
        description: "Principal's office and institute administration.",
        isDepartment: false,
        color: '#6366f1',
    },
];

const InteractiveMap = () => {
    const navigate = useNavigate();
    const [hoveredBuilding, setHoveredBuilding] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // All buildings rendered on the map: static non-dept + live dept entries
    const [buildings, setBuildings] = useState(STATIC_BUILDINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await api.get('/departments');
                const depts = res.data.data || [];

                // Only include departments that have coordinates and visibility enabled
                const deptBuildings = depts
                    .filter(d => d.mapCoordinates?.showOnMap && d.mapCoordinates?.points?.trim())
                    .map(d => ({
                        id: d.code.toLowerCase(),
                        name: d.name,
                        points: d.mapCoordinates.points,
                        description: d.description || `${d.name} department.`,
                        isDepartment: true,
                        color: d.mapCoordinates.color || '#3b82f6',
                    }));

                // Merge: non-department statics first, then live dept entries
                setBuildings([...STATIC_BUILDINGS, ...deptBuildings]);
            } catch (err) {
                console.warn('InteractiveMap: could not load departments from API.', err);
                // If API fails, only static buildings are shown — no broken state
            } finally {
                setLoading(false);
            }
        };

        fetchDepts();
    }, []);

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleBuildingClick = (building) => {
        if (!building?.isDepartment) return;
        navigate(`/department/${building.id}`);
        window.scrollTo(0, 0);
    };

    /** Returns fill color for a hovered polygon */
    const getFill = (building) => {
        const hex = (building.color || '#3b82f6').replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgba(${r},${g},${b},0.35)`;
    };

    return (
        <div className="flex flex-col space-y-6">
            {/* Mobile hint */}
            <p className="text-xs text-slate-400 text-center sm:hidden">Tap a building to explore its department</p>

            {/* Loading indicator */}
            {loading && (
                <p className="text-center text-xs text-slate-400 animate-pulse">Loading campus map…</p>
            )}

            <div
                ref={containerRef}
                className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 bg-slate-100 cursor-crosshair touch-auto select-none"
                onMouseMove={handleMouseMove}
            >
                {/* 1. Base satellite image */}
                <img
                    src={campusMap}
                    alt="VGEC Campus Satellite View"
                    className="w-full h-auto block pointer-events-none"
                />

                {/* 2. SVG polygon overlay */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 2000 2000"
                    preserveAspectRatio="xMidYMid slice"
                >
                    {buildings.map((building) => (
                        <motion.polygon
                            key={building.id}
                            points={building.points}
                            initial={{ opacity: 0, fill: 'rgba(30,41,59,0)' }}
                            whileHover={{
                                opacity: 1,
                                fill: getFill(building),
                                stroke: building.color || '#3b82f6',
                                strokeWidth: 2,
                            }}
                            className="cursor-pointer transition-all duration-200"
                            onHoverStart={() => setHoveredBuilding(building)}
                            onHoverEnd={() => setHoveredBuilding(null)}
                            onClick={() => handleBuildingClick(building)}
                        />
                    ))}
                </svg>

                {/* 3. Floating tooltip */}
                <AnimatePresence>
                    {hoveredBuilding && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute z-50 pointer-events-none bg-white/95 backdrop-blur-sm border border-slate-200 shadow-xl rounded-2xl p-4 w-60"
                            style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
                        >
                            <div
                                className="w-2 h-5 rounded-full absolute left-0 top-4 -translate-x-1"
                                style={{ background: hoveredBuilding.color || '#3b82f6' }}
                            />
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">
                                {hoveredBuilding.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                {hoveredBuilding.description}
                            </p>
                            {hoveredBuilding.isDepartment && (
                                <div
                                    className="mt-3 flex items-center text-[10px] font-bold uppercase tracking-widest"
                                    style={{ color: hoveredBuilding.color || '#3b82f6' }}
                                >
                                    <span>View Dept Hub</span>
                                    <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 4. VGEC branding overlay */}
                <div className="absolute bottom-10 right-10 z-40 bg-white/95 p-2 rounded-full backdrop-blur-md shadow-xl border border-slate-200 flex items-center justify-center pointer-events-none">
                    <img src={vgecLogo} alt="VGEC Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
                </div>
            </div>

            {/* Map legend */}
            {!loading && buildings.filter(b => b.isDepartment).length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                    {buildings.filter(b => b.isDepartment).map(b => (
                        <button
                            key={b.id}
                            onClick={() => { navigate(`/department/${b.id}`); window.scrollTo(0, 0); }}
                            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1 shadow-sm hover:shadow transition-all"
                        >
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
                            <span>{b.name.split('(')[0].trim()}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InteractiveMap;
