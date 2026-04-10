import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import campusMap from '../assets/campusmap.png';
import vgecLogo from '../assets/vgec_hd.png';

/**
 * InteractiveMap - A realistic campus navigator using a satellite image base.
 * Instructions for adding more buildings:
 * 1. Upload your 'campus_map_satellite.jpg' to a tool like https://www.image-map.net/
 * 2. Draw a 'Polygon' around the building perimeter.
 * 3. Copy the coordinate string (e.g., "120,45,140,60...") into a new object in the 'buildingData' array.
 */

const buildingData = [
    {
        id: 'me',
        name: 'Mechanical Engineering (M block)',
        points: "615,70,683,349,974,289,900,7",
        description: "Large department for machine design and workshops.",
        isDepartment: true
    },
    {
        id: 'library',
        name: 'VGEC Central Library',
        points: "1131,80,1077,356,1375,418,1432,162",
        description: "Resource center and quiet study areas.",
        isDepartment: false
    },
    {
        id: 'admin',
        name: 'Administrative Block',
        points: "1333,1406,1651,1344,1685,1679,1359,1698",
        description: "Principal's office and institute administration.",
        isDepartment: false
    },
    {
        id: 'cp',
        name: 'Computer Engineering (Block D)',
        points: "607,1542,564,1763,821,1822,866,1591",
        description: "Computing resources and AI/ML research.",
        isDepartment: true
    },
    {
        id: 'it',
        name: 'Information Technology (Block B)',
        points: "1035,1633,1334,1563,1397,1812,1098,1878",
        description: "Digital systems and network security.",
        isDepartment: true
    },
    {
        id: 'ee',
        name: 'Electrical Engineering (Block C)',
        points: "816,1367,1108,1379,1098,1618,811,1607",
        description: "Power systems and renewable energy.",
        isDepartment: true
    },
    {
        id: 'ch',
        name: 'Chemical Engineering (Block H/I)',
        points: "400,1479 500,1479 500,1579 400,1579",
        description: "Industrial chemistry and process engineering.",
        isDepartment: true
    },
    {
        id: 'cl',
        name: 'Civil Engineering (Block N)',
        points: "102,179,406,108,469,383,172,456",
        description: "Structural design and construction management.",
        isDepartment: true
    }
];

const InteractiveMap = () => {
    const navigate = useNavigate();
    const [hoveredBuilding, setHoveredBuilding] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // Track mouse for floating tooltip
    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleBuildingClick = (building) => {
        if (!building || !building.isDepartment) return;
        navigate(`/department/${building.id}`);
        window.scrollTo(0, 0);
    };

    return (
        <div className="flex flex-col space-y-6">
            <div
                ref={containerRef}
                className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 bg-slate-100 cursor-crosshair touch-none select-none"
                onMouseMove={handleMouseMove}
            >
                {/* 1. Base Image Layer */}
                <img
                    src={campusMap}
                    alt="VGEC Campus Satellite View"
                    className="w-full h-auto block pointer-events-none"
                />

                {/* 2. SVG Overlay Layer */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 2000 2000" // Updated for high-res coordinates
                    preserveAspectRatio="xMidYMid slice"
                >
                    {buildingData.map((building) => (
                        <motion.polygon
                            key={building.id}
                            points={building.points}
                            initial={{ opacity: 0, fill: "rgba(30, 41, 59, 0)" }}
                            whileHover={{
                                opacity: 1,
                                fill: "rgba(59, 130, 246, 0.3)", // Light blue tint on hover
                                stroke: "rgba(59, 130, 246, 0.8)",
                                strokeWidth: 2
                            }}
                            className="cursor-pointer transition-all duration-200"
                            onHoverStart={() => setHoveredBuilding(building)}
                            onHoverEnd={() => setHoveredBuilding(null)}
                            onClick={() => handleBuildingClick(building)}
                        />
                    ))}
                </svg>

                {/* 3. Floating Tooltip */}
                <AnimatePresence>
                    {hoveredBuilding && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute z-50 pointer-events-none bg-white/95 backdrop-blur-sm border border-slate-200 shadow-xl rounded-2xl p-4 w-60"
                            style={{
                                left: mousePos.x + 15,
                                top: mousePos.y + 15
                            }}
                        >
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">
                                {hoveredBuilding.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                {hoveredBuilding.description}
                            </p>
                            <div className="mt-3 flex items-center text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                                <span>View Dept Hub</span>
                                <svg className="w-3 h-3 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 4. Branding Overlay (Hides original map watermark) */}
                <div className="absolute bottom-10 right-10 z-40 bg-white/95 p-2 rounded-full backdrop-blur-md shadow-xl border border-slate-200 flex items-center justify-center pointer-events-none">
                    <img src={vgecLogo} alt="VGEC Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
                </div>
            </div>
        </div>
    );
};

export default InteractiveMap;
