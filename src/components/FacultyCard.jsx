import { Link } from 'react-router-dom';

const FacultyCard = ({ faculty }) => (
    <Link to={`/faculty/${faculty.id}`} className="block group">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-2xl">{faculty.name?.[0]}</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition">{faculty.name}</h3>
            <p className="text-sm text-accent font-medium mt-1">{faculty.designation}</p>
            <p className="text-xs text-gray-500 mt-1">{faculty.qualification}</p>
            <div className="mt-3 mb-4">
                <span className="inline-block bg-primary/5 text-primary text-xs font-medium px-3 py-1 rounded-full">{faculty.specialization}</span>
            </div>
            <div className="pt-3 border-t border-gray-100">
                <a href={`mailto:${faculty.email}`} className="text-xs text-gray-400 hover:text-accent transition" onClick={e => e.stopPropagation()}>
                    {faculty.email}
                </a>
            </div>
        </div>
    </Link>
);

export default FacultyCard;
