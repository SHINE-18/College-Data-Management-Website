import { Link } from 'react-router-dom';

const DepartmentCard = ({ department }) => (
    <Link to={`/departments/${department.id}`} className="block group">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="h-3 bg-gradient-to-r from-primary to-accent"></div>
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <span className="text-primary font-bold text-lg group-hover:text-white transition">{department.code}</span>
                    </div>
                    <span className="bg-accent/10 text-accent text-xs font-semibold px-3 py-1 rounded-full">{department.studentCount} Students</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition">{department.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{department.description}</p>
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">{department.hodName?.[0]}</span>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">HOD</p>
                        <p className="text-sm font-medium text-gray-700">{department.hodName}</p>
                    </div>
                </div>
            </div>
        </div>
    </Link>
);

export default DepartmentCard;
