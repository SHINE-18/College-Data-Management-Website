import DepartmentCard from '../../components/DepartmentCard';

const departments = [
    { id: 'cse', name: 'Computer Science & Engineering', code: 'CSE', description: 'Leading the way in computing, artificial intelligence, machine learning, and software development. Our department is at the forefront of technological innovation.', hodName: 'Dr. Rajesh Kumar', studentCount: 820 },
    { id: 'ece', name: 'Electronics & Communication Engineering', code: 'ECE', description: 'Excellence in electronics, VLSI design, embedded systems, and communication systems. Producing industry-ready engineers since 1985.', hodName: 'Dr. Priya Sharma', studentCount: 680 },
    { id: 'me', name: 'Mechanical Engineering', code: 'ME', description: 'Innovation in design, manufacturing, thermal engineering, and robotics. Our workshops and labs feature state-of-the-art equipment.', hodName: 'Dr. Suresh Patel', studentCount: 720 },
    { id: 'ce', name: 'Civil Engineering', code: 'CE', description: 'Building the future with sustainable infrastructure, structural design, environmental engineering, and urban planning.', hodName: 'Dr. Anita Singh', studentCount: 540 },
    { id: 'ee', name: 'Electrical Engineering', code: 'EE', description: 'Powering innovation in electrical systems, power electronics, renewable energy, and smart grid technologies.', hodName: 'Dr. Vikram Reddy', studentCount: 620 },
    { id: 'it', name: 'Information Technology', code: 'IT', description: 'Shaping the digital world with cutting-edge solutions in web technologies, cybersecurity, cloud computing, and data analytics.', hodName: 'Dr. Meena Gupta', studentCount: 780 },
];

const Departments = () => (
    <div className="animate-fade-in">
        <div className="bg-gradient-to-r from-primary to-accent py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Our Departments</h1>
                <p className="text-blue-100 max-w-2xl mx-auto">Discover our comprehensive range of engineering and technology departments, each committed to academic excellence and innovation.</p>
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
