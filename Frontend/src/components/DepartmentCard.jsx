import { Link } from 'react-router-dom';

const DepartmentCard = ({ department }) => (
    <Link to={`/departments/${department.id}`} className="block group">
        <div className="bg-blue-100 backdrop-blur-sm rounded-2xl border border-blue-50/60 overflow-hidden hover:shadow-xl hover:shadow-primary/8 transition-all duration-500 hover:-translate-y-1.5 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary/50"></div>
            <div className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-accent/5 rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-primary-700 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-primary/25">
                        <span className="text-primary font-bold text-lg group-hover:text-white transition-colors duration-500">{department.code}</span>
                    </div>
                    <span className="bg-accent/8 text-accent text-xs font-semibold px-3 py-1.5 rounded-full border border-accent/10">{department.studentCount} Students</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">{department.name}</h3>
                <p className="text-sm text-gray-400 mb-5 line-clamp-2 leading-relaxed">{department.description}</p>
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-100/80">
                    <div className="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center ring-2 ring-white">
                        <span className="text-xs font-bold text-gray-600">{department.hodName?.[0]}</span>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">HOD</p>
                        <p className="text-sm font-semibold text-gray-700">{department.hodName}</p>
                    </div>
                </div>
            </div>
        </div>
    </Link>
);

export default DepartmentCard;
