import { useParams } from 'react-router-dom';
import FacultyCard from '../../components/FacultyCard';

const deptData = {
    cse: {
        name: 'Computer Science & Engineering', code: 'CSE',
        hod: { name: 'Dr. Rajesh Kumar', message: 'Welcome to the Department of Computer Science & Engineering. We are committed to producing industry-ready professionals who can lead technological innovations. Our curriculum is designed to keep pace with the rapidly evolving tech landscape.' },
        vision: 'To be a globally recognized center of excellence in computing education and research, producing technocrats who make a difference.',
        mission: 'To provide quality education in computer science, foster innovation through research, and develop professionals with strong ethical values and social responsibility.',
        faculty: [
            { id: 'f1', name: 'Dr. Rajesh Kumar', designation: 'Professor & HOD', qualification: 'Ph.D. (IIT Delhi)', specialization: 'Artificial Intelligence', email: 'rajesh.k@college.edu' },
            { id: 'f2', name: 'Dr. Sneha Verma', designation: 'Associate Professor', qualification: 'Ph.D. (IISC)', specialization: 'Machine Learning', email: 'sneha.v@college.edu' },
            { id: 'f3', name: 'Prof. Amit Joshi', designation: 'Assistant Professor', qualification: 'M.Tech (NIT)', specialization: 'Data Science', email: 'amit.j@college.edu' },
            { id: 'f4', name: 'Dr. Kavita Nair', designation: 'Associate Professor', qualification: 'Ph.D. (IIT Madras)', specialization: 'Cybersecurity', email: 'kavita.n@college.edu' },
            { id: 'f5', name: 'Prof. Deepak Rao', designation: 'Assistant Professor', qualification: 'M.Tech (IIIT)', specialization: 'Cloud Computing', email: 'deepak.r@college.edu' },
            { id: 'f6', name: 'Dr. Pooja Mehta', designation: 'Professor', qualification: 'Ph.D. (IIT Bombay)', specialization: 'Computer Vision', email: 'pooja.m@college.edu' },
        ],
        labs: [
            { name: 'AI & ML Lab', capacity: 60, inCharge: 'Dr. Sneha Verma' },
            { name: 'Network Security Lab', capacity: 40, inCharge: 'Dr. Kavita Nair' },
            { name: 'Software Engineering Lab', capacity: 60, inCharge: 'Prof. Amit Joshi' },
            { name: 'Cloud Computing Lab', capacity: 40, inCharge: 'Prof. Deepak Rao' },
            { name: 'Programming Lab', capacity: 80, inCharge: 'Prof. Amit Joshi' },
        ],
        courses: [
            { sem: 1, subjects: ['Engineering Mathematics I', 'Physics', 'Basic Electronics', 'Programming in C', 'Workshop Practice'] },
            { sem: 2, subjects: ['Mathematics II', 'Chemistry', 'Data Structures', 'Digital Logic', 'English Communication'] },
            { sem: 3, subjects: ['Discrete Mathematics', 'OOP with Java', 'Computer Architecture', 'Database Systems', 'OS Concepts'] },
            { sem: 4, subjects: ['Design & Analysis of Algorithms', 'Computer Networks', 'Software Engineering', 'Theory of Computation', 'Web Technologies'] },
            { sem: 5, subjects: ['Artificial Intelligence', 'Compiler Design', 'Cloud Computing', 'Information Security', 'Elective I'] },
            { sem: 6, subjects: ['Machine Learning', 'Distributed Systems', 'Mobile Computing', 'Elective II', 'Mini Project'] },
            { sem: 7, subjects: ['Deep Learning', 'Big Data Analytics', 'Elective III', 'Elective IV', 'Major Project I'] },
            { sem: 8, subjects: ['Major Project II', 'Internship', 'Elective V', 'Seminar'] },
        ],
        achievements: [
            'Best Department Award — University Level 2025',
            '12 Scopus-indexed publications in Q1 journals this year',
            'Students won 1st prize at Smart India Hackathon 2025',
            'NBA Accredited for 5 years',
            'MoU signed with Google, Microsoft, and Amazon for research collaboration',
        ],
    },
};

// Fallback for other department IDs
const fallbackDept = {
    name: 'Department Details', code: 'DEPT',
    hod: { name: 'Dr. Faculty Head', message: 'Welcome to our department. We strive for excellence in education and research.' },
    vision: 'To be a leading center of academic and research excellence.',
    mission: 'To nurture talent and foster innovation for societal benefit.',
    faculty: [
        { id: 'f1', name: 'Dr. Faculty Member', designation: 'Professor & HOD', qualification: 'Ph.D.', specialization: 'Core Subject', email: 'faculty@college.edu' },
    ],
    labs: [{ name: 'Department Lab', capacity: 60, inCharge: 'Dr. Faculty Member' }],
    courses: [{ sem: 1, subjects: ['Subject 1', 'Subject 2', 'Subject 3'] }],
    achievements: ['Department Achievement 1', 'Department Achievement 2'],
};

const DepartmentDetail = () => {
    const { id } = useParams();
    const dept = deptData[id] || { ...fallbackDept, name: `${id?.toUpperCase()} Department` };

    return (
        <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-primary to-accent py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-2 text-blue-200 text-sm mb-4">
                        <a href="/departments" className="hover:text-white transition">Departments</a>
                        <span>/</span>
                        <span className="text-white">{dept.name}</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">{dept.name}</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
                {/* HOD Section */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                            <span className="text-white font-bold text-3xl">{dept.hod.name[0]}</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{dept.hod.name}</h2>
                            <p className="text-accent font-medium text-sm mb-3">Head of Department</p>
                            <p className="text-gray-600 leading-relaxed">{dept.hod.message}</p>
                        </div>
                    </div>
                </section>

                {/* Vision & Mission */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-primary mb-3 flex items-center space-x-2">
                            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            <span>Vision</span>
                        </h3>
                        <p className="text-gray-600 leading-relaxed">{dept.vision}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-primary mb-3 flex items-center space-x-2">
                            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <span>Mission</span>
                        </h3>
                        <p className="text-gray-600 leading-relaxed">{dept.mission}</p>
                    </div>
                </section>

                {/* Faculty */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Faculty Members</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {dept.faculty.map(f => <FacultyCard key={f.id} faculty={f} />)}
                    </div>
                </section>

                {/* Labs */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Laboratories</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-primary text-white">
                                    <th className="text-left px-6 py-3 text-sm font-semibold">Lab Name</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold">Capacity</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold">In-Charge</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dept.labs.map((lab, i) => (
                                    <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{lab.name}</td>
                                        <td className="px-6 py-3 text-sm text-gray-600">{lab.capacity}</td>
                                        <td className="px-6 py-3 text-sm text-gray-600">{lab.inCharge}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Courses */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Courses Offered</h2>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-primary text-white">
                                    <th className="text-left px-6 py-3 text-sm font-semibold w-32">Semester</th>
                                    <th className="text-left px-6 py-3 text-sm font-semibold">Subjects</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dept.courses.map((c, i) => (
                                    <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                        <td className="px-6 py-3 text-sm font-semibold text-primary">Semester {c.sem}</td>
                                        <td className="px-6 py-3 text-sm text-gray-600">{c.subjects.join(' • ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Achievements */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dept.achievements.map((a, i) => (
                            <div key={i} className="flex items-start space-x-3 bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
                                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                </div>
                                <p className="text-sm text-gray-700">{a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Gallery Placeholder */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Department Gallery</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center hover:from-primary/20 hover:to-accent/20 transition group">
                                <svg className="w-8 h-8 text-primary/30 group-hover:text-primary/50 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DepartmentDetail;
