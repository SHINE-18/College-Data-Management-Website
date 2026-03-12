import { useState } from 'react';
import FacultyCard from '../../components/FacultyCard';

const allFaculty = [
    { id: 'f1', name: 'Prof. Kajal S. Patel', designation: 'Associate Professor & HOD', qualification: 'Ph.D.', specialization: 'Artificial Intelligence', email: 'kajalpatel@vgecg.ac.in', department: 'CE' },
    { id: 'f2', name: 'Prof. Hetal A. Joshiara', designation: 'Associate Professor', qualification: 'Ph.D.', specialization: 'Machine Learning', email: 'hetaljoshiyara@vgecg.ac.in', department: 'CE' },
    { id: 'f3', name: 'Prof. Viral Borisagar', designation: 'Associate Professor', qualification: 'Ph.D.', specialization: 'Data Science', email: 'vhborisagar@vgecg.ac.in', department: 'CE' },
    { id: 'f4', name: 'Prof. Jalpa M. Ramavat', designation: 'Assistant Professor', qualification: 'Ph.D.', specialization: 'Cybersecurity', email: 'jalpa.ramavat.2012@vgecg.ac.in', department: 'CE' },
    { id: 'f5', name: 'Prof. Nakul R. Dave', designation: 'Assistant Professor', qualification: 'Ph.D.', specialization: 'Cloud Computing', email: '', department: 'CE' },
    { id: 'f6', name: 'Prof. Amit H. Rathod', designation: 'Assistant Professor', qualification: 'Ph.D.', specialization: 'Artificial Intelligence', email: '', department: 'CE' },
    { id: 'f7', name: 'Prof. Nirav B. Suthar', designation: 'Assistant Professor', qualification: 'M.E.', specialization: 'Computer Vision', email: '', department: 'CE' },
    { id: 'f8', name: 'Prof. Jaimin M. Shroff', designation: 'Assistant Professor', qualification: 'M. Tech', specialization: 'Cloud Computing', email: '', department: 'CE' },
    { id: 'f9', name: 'Prof. Rahul K. Shah', designation: 'Assistant Professor', qualification: 'M. Tech', specialization: 'Information Security', email: 'rkshah@vgecg.ac.in', department: 'CE' },
    { id: 'f10', name: 'Prof. Bhavinkumar N. Patel', designation: 'Assistant Professor', qualification: 'M.E.', specialization: 'Embedded Systems', email: 'bnpatel@vgecg.ac.in', department: 'CE' },
];

const designations = ['All', 'Associate Professor & HOD', 'Associate Professor', 'Assistant Professor'];

const FacultyDirectory = () => {
    const [search, setSearch] = useState('');
    const [desigFilter, setDesigFilter] = useState('All');

    const filtered = allFaculty.filter(f => {
        const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.specialization.toLowerCase().includes(search.toLowerCase());
        const matchDesig = desigFilter === 'All' || f.designation === desigFilter;
        return matchSearch && matchDesig;
    });

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="section-title text-2xl">Faculty — Computer Engineering</h1>
                    <p className="text-gray-500 text-sm mt-2 pl-4">Meet our distinguished faculty members from the Department of Computer Engineering, VGEC</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters (IIT Madras-inspired) */}
                    <div className="lg:w-56 shrink-0">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-36">
                            <h3 className="font-heading font-bold text-sm text-gray-900 mb-3 uppercase tracking-wider">Filters</h3>

                            {/* Search */}
                            <div className="mb-4">
                                <input
                                    id="faculty-search"
                                    type="text"
                                    placeholder="Search name..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                />
                            </div>

                            {/* Designation filter */}
                            <div>
                                <label className="text-xs text-gray-500 font-medium mb-1 block">Designation</label>
                                <select
                                    id="desig-filter"
                                    value={desigFilter}
                                    onChange={e => setDesigFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-white"
                                >
                                    {designations.map(d => <option key={d} value={d}>{d === 'All' ? 'All Designations' : d}</option>)}
                                </select>
                            </div>

                            <p className="text-xs text-gray-400 mt-4">{filtered.length} faculty found</p>
                        </div>
                    </div>

                    {/* Faculty Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filtered.map(f => <FacultyCard key={f.id} faculty={f} />)}
                        </div>
                        {filtered.length === 0 && (
                            <div className="text-center py-16 text-gray-400">
                                <p className="text-lg">No faculty found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyDirectory;
