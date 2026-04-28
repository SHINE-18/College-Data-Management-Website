import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DepartmentCard from '../../components/DepartmentCard';
import api from '../../utils/axios';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('/departments');
                const depts = res.data.data || [];

                // Map DB fields to what DepartmentCard expects
                const mapped = depts.map(d => ({
                    id: d.code?.toLowerCase() || d._id,
                    _id: d._id,
                    name: d.name,
                    code: d.code,
                    description: d.description || '',
                    hodName: d.hod?.name || 'TBD',
                    studentCount: d.stats?.find(s => s.label?.toLowerCase().includes('student'))?.val || 0,
                }));
                setDepartments(mapped);
            } catch (err) {
                console.error('Failed to fetch departments:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDepartments();
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-primary-700 to-primary py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Departments</h1>
                    <p className="text-primary-200 max-w-2xl mx-auto">
                        Discover our comprehensive range of engineering and technology departments,
                        each committed to academic excellence and innovation.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="h-52 bg-slate-100 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : departments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {departments.map(dept => (
                            <DepartmentCard key={dept._id} department={dept} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
                        <p className="text-lg font-medium">No departments found.</p>
                        <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">Return Home</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Departments;
