import { useState } from 'react';
import FacultyCard from '../../components/FacultyCard';

const allFaculty = [
    { id: 'f1', name: 'Dr. Rajesh Kumar', designation: 'Professor & HOD', qualification: 'Ph.D. (IIT Delhi)', specialization: 'Artificial Intelligence', email: 'rajesh.k@college.edu', department: 'CSE' },
    { id: 'f2', name: 'Dr. Sneha Verma', designation: 'Associate Professor', qualification: 'Ph.D. (IISC)', specialization: 'Machine Learning', email: 'sneha.v@college.edu', department: 'CSE' },
    { id: 'f3', name: 'Prof. Amit Joshi', designation: 'Assistant Professor', qualification: 'M.Tech (NIT)', specialization: 'Data Science', email: 'amit.j@college.edu', department: 'CSE' },
    { id: 'f4', name: 'Dr. Kavita Nair', designation: 'Associate Professor', qualification: 'Ph.D. (IIT Madras)', specialization: 'Cybersecurity', email: 'kavita.n@college.edu', department: 'CSE' },
    { id: 'f5', name: 'Dr. Priya Sharma', designation: 'Professor & HOD', qualification: 'Ph.D. (IIT Bombay)', specialization: 'VLSI Design', email: 'priya.s@college.edu', department: 'ECE' },
    { id: 'f6', name: 'Prof. Deepak Rao', designation: 'Assistant Professor', qualification: 'M.Tech (IIIT)', specialization: 'Cloud Computing', email: 'deepak.r@college.edu', department: 'IT' },
    { id: 'f7', name: 'Dr. Suresh Patel', designation: 'Professor & HOD', qualification: 'Ph.D. (IIT Kanpur)', specialization: 'Thermal Engineering', email: 'suresh.p@college.edu', department: 'ME' },
    { id: 'f8', name: 'Dr. Anita Singh', designation: 'Professor & HOD', qualification: 'Ph.D. (IIT Roorkee)', specialization: 'Structural Engineering', email: 'anita.s@college.edu', department: 'CE' },
    { id: 'f9', name: 'Dr. Vikram Reddy', designation: 'Professor & HOD', qualification: 'Ph.D. (IISC)', specialization: 'Power Systems', email: 'vikram.r@college.edu', department: 'EE' },
    { id: 'f10', name: 'Dr. Meena Gupta', designation: 'Professor & HOD', qualification: 'Ph.D. (IIT Kharagpur)', specialization: 'Information Security', email: 'meena.g@college.edu', department: 'IT' },
    { id: 'f11', name: 'Dr. Pooja Mehta', designation: 'Professor', qualification: 'Ph.D. (IIT Bombay)', specialization: 'Computer Vision', email: 'pooja.m@college.edu', department: 'CSE' },
    { id: 'f12', name: 'Prof. Rahul Desai', designation: 'Assistant Professor', qualification: 'M.Tech (NIT)', specialization: 'Embedded Systems', email: 'rahul.d@college.edu', department: 'ECE' },
];

const departments = ['All', 'CSE', 'ECE', 'ME', 'CE', 'EE', 'IT'];
const designations = ['All', 'Professor & HOD', 'Professor', 'Associate Professor', 'Assistant Professor'];

const FacultyDirectory = () => {
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [desigFilter, setDesigFilter] = useState('All');

    const filtered = allFaculty.filter(f => {
        const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.specialization.toLowerCase().includes(search.toLowerCase());
        const matchDept = deptFilter === 'All' || f.department === deptFilter;
        const matchDesig = desigFilter === 'All' || f.designation === desigFilter;
        return matchSearch && matchDept && matchDesig;
    });

    return (
        <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-primary to-accent py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Faculty Directory</h1>
                    <p className="text-blue-100 max-w-2xl mx-auto">Meet our distinguished faculty members who bring expertise and passion to education.</p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input id="faculty-search" type="text" placeholder="Search by name or specialization..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition" />
                    </div>
                    <select id="dept-filter" value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition bg-white">
                        {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                    </select>
                    <select id="desig-filter" value={desigFilter} onChange={e => setDesigFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none transition bg-white">
                        {designations.map(d => <option key={d} value={d}>{d === 'All' ? 'All Designations' : d}</option>)}
                    </select>
                </div>
                <p className="text-sm text-gray-500 mb-4">{filtered.length} faculty members found</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {filtered.map(f => <FacultyCard key={f.id} faculty={f} />)}
                </div>
                {filtered.length === 0 && <div className="text-center py-16 text-gray-400"><p className="text-lg">No faculty found matching your criteria.</p></div>}
            </div>
        </div>
    );
};

export default FacultyDirectory;
