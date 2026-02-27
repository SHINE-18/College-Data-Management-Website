import { useParams } from 'react-router-dom';

const facultyData = {
    f1: {
        name: 'Dr. Rajesh Kumar', designation: 'Professor & HOD', department: 'Computer Science & Engineering',
        joiningDate: '2008-07-15', email: 'rajesh.k@college.edu', phone: '+91 98765 43210',
        education: [
            { degree: 'B.Tech', field: 'Computer Science', university: 'JNTU Hyderabad', year: 2000 },
            { degree: 'M.Tech', field: 'Computer Science & Engineering', university: 'IIT Delhi', year: 2003 },
            { degree: 'Ph.D.', field: 'Artificial Intelligence', university: 'IIT Delhi', year: 2008 },
        ],
        subjects: [
            { name: 'Artificial Intelligence', code: 'CS601', semester: 5, branch: 'CSE' },
            { name: 'Deep Learning', code: 'CS701', semester: 7, branch: 'CSE' },
            { name: 'Research Methodology', code: 'CS801', semester: 8, branch: 'CSE' },
        ],
        publications: [
            { title: 'Deep Learning for Natural Language Understanding', journal: 'IEEE Transactions on AI', year: 2024, indexType: 'SCI', doi: '10.1109/TAI.2024.001' },
            { title: 'Federated Learning in Healthcare: A Comprehensive Survey', journal: 'ACM Computing Surveys', year: 2023, indexType: 'SCI', doi: '10.1145/ACM.2023.045' },
            { title: 'Transformer Architecture for Code Generation', journal: 'Neural Computing & Applications', year: 2023, indexType: 'Scopus', doi: '10.1007/NCAA.2023.112' },
            { title: 'Edge AI for Real-time Object Detection', journal: 'Computer Vision & Image Understanding', year: 2022, indexType: 'SCI', doi: '10.1016/CVIU.2022.078' },
        ],
        fdps: [
            { name: 'FDP on Machine Learning & Deep Learning', organizer: 'IIT Bombay', year: 2024, duration: '5 Days' },
            { name: 'Workshop on Research Paper Writing', organizer: 'Springer Nature', year: 2023, duration: '3 Days' },
            { name: 'FDP on Cloud & Edge Computing', organizer: 'IISC Bangalore', year: 2022, duration: '1 Week' },
        ],
        awards: [
            'Best Researcher Award — University Level 2024',
            'Outstanding Faculty Award — AICTE 2023',
            'Best Paper Award — IEEE Conference 2022',
        ],
        memberships: ['IEEE Senior Member', 'ACM Professional Member', 'CSI Life Member', 'ISTE Member'],
    },
};

const defaultFaculty = {
    name: 'Dr. Faculty Member', designation: 'Professor', department: 'Department',
    joiningDate: '2015-01-01', email: 'faculty@college.edu', phone: '+91 98765 00000',
    education: [{ degree: 'Ph.D.', field: 'Subject', university: 'University', year: 2015 }],
    subjects: [{ name: 'Subject', code: 'SUB101', semester: 1, branch: 'DEPT' }],
    publications: [],
    fdps: [],
    awards: ['Faculty Achievement'],
    memberships: ['Professional Body Member'],
};

const FacultyProfile = () => {
    const { id } = useParams();
    const faculty = facultyData[id] || defaultFaculty;

    const indexColors = { SCI: 'bg-green-100 text-green-700', Scopus: 'bg-blue-100 text-blue-700', UGC: 'bg-purple-100 text-purple-700' };

    return (
        <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-primary to-accent py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                            <span className="text-white font-bold text-4xl">{faculty.name[0]}</span>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white">{faculty.name}</h1>
                            <p className="text-blue-200 font-medium mt-1">{faculty.designation}</p>
                            <p className="text-blue-100 text-sm mt-1">{faculty.department}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-blue-100">
                                <span className="flex items-center space-x-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    <span>{faculty.email}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span>Joined: {new Date(faculty.joiningDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
                {/* Education Timeline */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Education</h2>
                    <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-accent/20"></div>
                        {faculty.education.map((edu, i) => (
                            <div key={i} className="relative pl-10 pb-6 last:pb-0">
                                <div className="absolute left-2.5 top-1.5 w-3 h-3 bg-accent rounded-full border-2 border-white shadow"></div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-primary text-sm">{edu.degree} in {edu.field}</h3>
                                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">{edu.year}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">{edu.university}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Currently Teaching */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 pb-0"><h2 className="text-lg font-bold text-gray-900 mb-4">Currently Teaching</h2></div>
                    <table className="w-full">
                        <thead><tr className="bg-gray-50 border-y border-gray-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Semester</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Branch</th>
                        </tr></thead>
                        <tbody>
                            {faculty.subjects.map((s, i) => (
                                <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{s.code}</td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{s.semester}</td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{s.branch}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Publications */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Publications ({faculty.publications.length})</h2>
                    <div className="space-y-4">
                        {faculty.publications.map((p, i) => (
                            <div key={i} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900">{p.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{p.journal} • {p.year}</p>
                                    </div>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${indexColors[p.indexType] || 'bg-gray-100 text-gray-700'}`}>{p.indexType}</span>
                                </div>
                                {p.doi && <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline mt-2 inline-block">DOI: {p.doi}</a>}
                            </div>
                        ))}
                    </div>
                </section>

                {/* FDPs & Workshops */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 pb-0"><h2 className="text-lg font-bold text-gray-900 mb-4">FDPs & Workshops</h2></div>
                    <table className="w-full">
                        <thead><tr className="bg-gray-50 border-y border-gray-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Program</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Organized By</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Year</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Duration</th>
                        </tr></thead>
                        <tbody>
                            {faculty.fdps.map((f, i) => (
                                <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                    <td className="px-6 py-3 text-sm font-medium text-gray-900">{f.name}</td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{f.organizer}</td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{f.year}</td>
                                    <td className="px-6 py-3 text-sm text-gray-600">{f.duration}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Awards & Memberships */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Awards & Achievements</h2>
                        <ul className="space-y-3">
                            {faculty.awards.map((a, i) => (
                                <li key={i} className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <svg className="w-3.5 h-3.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                    </div>
                                    <span className="text-sm text-gray-700">{a}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Professional Memberships</h2>
                        <ul className="space-y-3">
                            {faculty.memberships.map((m, i) => (
                                <li key={i} className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <span className="text-sm text-gray-700">{m}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyProfile;
