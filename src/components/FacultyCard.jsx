import { Link } from 'react-router-dom';
import { getAssetUrl } from '../utils/axios';

const specializations = {
    'Artificial Intelligence': { color: 'bg-red-600', label: 'AI/ML' },
    'Machine Learning': { color: 'bg-red-600', label: 'AI/ML' },
    'Data Science': { color: 'bg-purple-600', label: 'Data Science' },
    'Cybersecurity': { color: 'bg-green-600', label: 'Security' },
    'Cloud Computing': { color: 'bg-blue-600', label: 'Cloud' },
    'VLSI Design': { color: 'bg-yellow-600', label: 'VLSI' },
    'Thermal Engineering': { color: 'bg-orange-600', label: 'Thermal' },
    'Structural Engineering': { color: 'bg-teal-600', label: 'Structures' },
    'Power Systems': { color: 'bg-indigo-600', label: 'Power' },
    'Information Security': { color: 'bg-green-600', label: 'Security' },
    'Computer Vision': { color: 'bg-red-600', label: 'AI/ML' },
    'Embedded Systems': { color: 'bg-blue-600', label: 'Embedded' },
};

const FacultyCard = ({ faculty }) => {
    // Handle both API format (_id) and legacy format (id)
    const facultyId = faculty._id || faculty.id;
    const facultyName = faculty.name || '';
    const facultyDesignation = faculty.designation || '';
    const facultyQualification = faculty.qualification || '';
    const facultySpecialization = faculty.specialization || '';
    const facultyEmail = faculty.email || '';
    const facultyPhoto = faculty.profilePhoto || '';
    
    const spec = specializations[facultySpecialization] || { 
        color: 'bg-gray-600', 
        label: facultySpecialization?.slice(0, 10) || 'Faculty' 
    };

    return (
        <Link to={`/faculty/${facultyId}`} className="block group">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-center relative">
                {/* Research Tag */}
                <div className="absolute top-3 left-3 z-10">
                    <span className={`${spec.color} text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider`}>
                        {spec.label}
                    </span>
                </div>

                {/* Circular Photo */}
                <div className="pt-10 pb-4 px-4">
                    <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 ring-4 ring-white overflow-hidden">
                        {facultyPhoto ? (
                            <img 
                                src={getAssetUrl(facultyPhoto)} 
                                alt={facultyName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'block';
                                }}
                            />
                        ) : null}
                        <span 
                            className="text-white font-bold text-3xl font-heading"
                            style={{ display: facultyPhoto ? 'none' : 'block' }}
                        >
                            {facultyName?.[0]}
                        </span>
                    </div>
                </div>

                {/* Details */}
                <div className="px-4 pb-5">
                    <h3 className="font-heading font-bold text-gray-900 group-hover:text-primary transition text-base">
                        {facultyName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{facultyDesignation}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{facultyQualification}</p>

                    {/* Specialization */}
                    <p className="text-sm text-primary font-medium mt-3 leading-snug">
                        {facultySpecialization}
                    </p>

                    {/* Email */}
                    {facultyEmail && (
                        <div className="pt-3 mt-3 border-t border-gray-100">
                            <a 
                                href={`mailto:${facultyEmail}`} 
                                className="text-xs text-gray-400 hover:text-primary transition"
                                onClick={e => e.stopPropagation()}
                            >
                                {facultyEmail}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default FacultyCard;

