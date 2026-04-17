import DepartmentCard from '../../components/DepartmentCard';
import { DEPARTMENT_DETAILS } from '../../constants/departments';

const departments = DEPARTMENT_DETAILS.map(dept => ({
    ...dept,
    // Add default values for missing fields to maintain UI consistency
    hodName: 'Dr. TBD',
    studentCount: 0
}));

const Departments = () => (
    <div className="animate-fade-in">
        <div className="bg-gradient-to-r from-primary-700 to-primary py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Departments</h1>
                <p className="text-primary-200 max-w-2xl mx-auto">Discover our comprehensive range of engineering and technology departments, each committed to academic excellence and innovation.</p>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map(dept => (
                    <DepartmentCard key={dept.id} department={dept} />
                ))}
            </div>
        </div>
    </div>
);

export default Departments;
