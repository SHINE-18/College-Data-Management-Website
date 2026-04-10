// ============================================
// seedDepartments.js — Import existing mock data to MongoDB
// Run this once: node seedDepartments.js
// ============================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Department = require('./models/Department');

dotenv.config();

const DEPARTMENTS_DATA = [
    {
        name: 'Chemical Engineering', code: 'CH', established: 1948,
        description: 'Focusing on the design and operation of chemical plants and methods of improving production.',
        detailAbout: 'The Department of Chemical Engineering has a long history of excellence. Our curriculum focuses on bridging the gap between chemistry and engineering to solve real-world industrial problems. Our state-of-the-art labs provide hands-on experience.',
        hod: { name: 'Dr. A. K. Shah', message: 'Welcome to the Chemical Engineering Department. We focus on bridging the gap between chemistry and engineering to solve real-world industrial problems.' },
        vision: 'To provide high-quality education and research in chemical engineering and develop leaders for sustainable development.',
        mission: 'Excellence in teaching and research, fostering industry-academia partnership, and instilling social responsibility.',
        achievements: ['NBA Accredited', 'Top placements in ONGC and Reliance', '15+ Research publications this year'],
        researchAreas: [
            { title: 'Process Systems Engineering', faculty: 3, projects: 5, courses: 4 },
            { title: 'Environmental Engineering', faculty: 2, projects: 8, courses: 3 },
            { title: 'Catalysis and Reaction Engineering', faculty: 2, projects: 4, courses: 2 },
        ],
        placementStats: [
            { name: 'Reliance Industries', count: 18 },
            { name: 'ONGC', count: 12 },
            { name: 'L&T Hydrocarbon', count: 8 },
            { name: 'Torrent Pharma', count: 10 },
            { name: 'GSFC', count: 6 }
        ],
        stats: [
            { val: '18', label: 'Faculty Members' },
            { val: '60', label: 'Student Intake' },
            { val: '6', label: 'Laboratories' },
            { val: '1948', label: 'Est. Year' },
        ]
    },
    {
        name: 'Computer Engineering', code: 'CP', established: 1953,
        description: 'Leading the way in computing, artificial intelligence, machine learning, and software development.',
        detailAbout: 'The Department of Computer Engineering at Vishwakarma Government Engineering College was established in 2001 with an annual intake of 120 students. The department is committed to creating an environment for providing value-based education through innovation, teamwork, and ethical practices. Affiliated to Gujarat Technological University (GTU) and approved by AICTE, the department offers a rigorous B.E. program that prepares students to meet the demands of industry, government, society, and the scientific community.',
        hod: { name: 'Prof. Kajal S. Patel', message: 'Welcome to the Department of Computer Engineering at VGEC. Our department is dedicated to producing computer engineering graduates who are equipped to meet the demands of industry, government, and society. We focus on developing state-of-the-art computing facilities and academic infrastructure while building partnerships with industries for knowledge sharing.' },
        vision: 'To create an environment for providing value-based education in Computer Engineering through innovation, teamwork, and ethical practices.',
        mission: 'To produce computer engineering graduates who are equipped to meet the demands of industry, government, and society.',
        achievements: ['Smart India Hackathon 2025 Winners', '100% Placement record for 3 consecutive years', 'MoU with Google for Cloud Excellence'],
        researchAreas: [
            { title: 'Artificial Intelligence & Machine Learning', faculty: 4, projects: 12, courses: 6 },
            { title: 'Computer Networks & Security', faculty: 3, projects: 8, courses: 5 },
            { title: 'Software Engineering & Web Technologies', faculty: 3, projects: 10, courses: 7 },
        ],
        placementStats: [
            { name: 'Bacancy Technology', count: 20 },
            { name: 'Simform Solutions', count: 14 },
            { name: 'einfochips Ltd', count: 14 },
            { name: 'eSparkBiz', count: 10 },
            { name: 'Tatva Soft', count: 7 },
            { name: 'TCS', count: 4 },
        ],
        stats: [
            { val: '22', label: 'Faculty Members' },
            { val: '120', label: 'Student Intake' },
            { val: '8', label: 'Laboratories' },
            { val: '2001', label: 'Est. Year' },
        ]
    },
    {
        name: 'Civil Engineering', code: 'CL', established: 1958,
        description: 'Building the future with sustainable infrastructure, structural design, and urban planning.',
        detailAbout: 'The Civil Engineering Department is committed to creating infrastructure innovators. With exposure to advanced structural design and hands-on site experience, students go on to construct modern marvels while prioritizing sustainability and ecological balance.',
        hod: { name: 'Dr. V. P. Patel', message: 'Civil engineering is the backbone of infrastructure. Our mission is to build safer and more sustainable cities for the future.' },
        vision: 'To become a center of excellence in civil engineering education and research for human development.',
        mission: 'To produce competent civil engineers, develop innovative technologies, and provide professional services to the society.',
        achievements: ['Excellence Award in Structural Design 2024', 'Consultancy projects for Gujarat Govt', 'Specialized Concrete Tech Lab'],
        researchAreas: [
            { title: 'Structural Engineering', faculty: 5, projects: 10, courses: 6 },
            { title: 'Transportation Engineering', faculty: 3, projects: 7, courses: 4 },
            { title: 'Geotechnical Engineering', faculty: 2, projects: 4, courses: 3 },
        ],
        placementStats: [
            { name: 'Adani Infrastructure', count: 12 },
            { name: 'L&T Construction', count: 10 },
            { name: 'Shapoorji Pallonji', count: 8 },
            { name: 'GSRDC', count: 5 }
        ],
        stats: [
            { val: '20', label: 'Faculty Members' },
            { val: '120', label: 'Student Intake' },
            { val: '9', label: 'Laboratories' },
            { val: '1958', label: 'Est. Year' },
        ]
    },
    {
        name: 'Electrical Engineering', code: 'EE', established: 1963,
        description: 'Powering innovation in electrical systems, renewable energy, and smart grid technologies.',
        detailAbout: 'As one of the oldest and most dynamic departments, our Electrical Engineering graduates pioneer solutions in renewable energy and power systems. Equipped with advanced technology labs to replicate modern power grids, we create industry-ready leaders.',
        hod: { name: 'Dr. S. R. Mehta', message: 'We are at the forefront of the renewable energy revolution. Our students learn to power the world efficiently and sustainably.' },
        vision: 'To empower students with advanced knowledge and skills in electrical engineering to meet global challenges.',
        mission: 'To provide quality education, promote research in energy systems, and nurture professional ethics.',
        achievements: ['Smart Grid Research Grant', 'State-of-the-art High Voltage Lab', 'First prize in Power-Tech Expo'],
        researchAreas: [
            { title: 'Power Systems & Smart Grids', faculty: 4, projects: 12, courses: 5 },
            { title: 'Renewable Energy Methods', faculty: 3, projects: 9, courses: 4 },
            { title: 'Control Systems', faculty: 2, projects: 4, courses: 3 },
        ],
        placementStats: [
            { name: 'Tata Power', count: 14 },
            { name: 'Torrent Power', count: 12 },
            { name: 'Siemens', count: 8 },
            { name: 'GE Renewable', count: 6 },
            { name: 'Adani Power', count: 5 }
        ],
        stats: [
            { val: '24', label: 'Faculty Members' },
            { val: '120', label: 'Student Intake' },
            { val: '10', label: 'Laboratories' },
            { val: '1963', label: 'Est. Year' },
        ]
    },
    {
        name: 'Electronics & Communication Engineering', code: 'EC', established: 1968,
        description: 'Excellence in electronics, VLSI design, and communication systems.',
        detailAbout: 'The EC Department aims to deliver high-quality technical education aligned with today’s fast-paced digital era. Our expertise spans VLSI design, embedded systems, networking, and wireless communication, building foundation for 5G and IoT.',
        hod: { name: 'Dr. M. N. Singh', message: 'Communication connects the world. We prepare our students for the 5G and IoT era with hands-on technical skills.' },
        vision: 'To achieve global recognition in electronics and communication engineering education and research.',
        mission: 'To impart technical knowledge, foster innovation in VLSI and embedded systems, and develop entrepreneurial skills.',
        achievements: ['VLSI Design Center Establishment', 'Patent for Low-power Communication System', 'Placement in Intel and Qualcomm'],
        researchAreas: [
            { title: 'VLSI & Embedded Systems', faculty: 4, projects: 9, courses: 6 },
            { title: 'Wireless Communication & 5G/6G', faculty: 3, projects: 7, courses: 5 },
            { title: 'Internet of Things (IoT)', faculty: 3, projects: 12, courses: 4 },
        ],
        placementStats: [
            { name: 'eInfochips', count: 22 },
            { name: 'Intel', count: 4 },
            { name: 'Qualcomm', count: 3 },
            { name: 'TCS', count: 16 },
            { name: 'Vodafone Idea', count: 8 }
        ],
        stats: [
            { val: '21', label: 'Faculty Members' },
            { val: '120', label: 'Student Intake' },
            { val: '9', label: 'Laboratories' },
            { val: '1968', label: 'Est. Year' },
        ]
    },
    {
        name: 'Information Technology', code: 'IT', established: 1973,
        description: 'Shaping the digital world with solutions in web technologies, cybersecurity, and data analytics.',
        detailAbout: 'The Department of IT is a hub for software ingenuity. Our modern infrastructure and emphasis on experiential learning in software lifecycle engineering empower our students to adapt swiftly to the modern industrial context.',
        hod: { name: 'Dr. J. S. Dave', message: 'The digital transformation is here. We guide our students to become architects of the next-generation digital ecosystem.' },
        vision: 'To produce innovative IT professionals who contribute to global technological advancements.',
        mission: 'To provide a strong foundation in IT, encourage lifelong learning, and promote ethical use of technology.',
        achievements: ['Cyber Security Excellence Hub', 'Top-tier results in GTU examinations', 'Industry collaborations for Data Analytics'],
        researchAreas: [
            { title: 'Cyber Security & Cryptography', faculty: 3, projects: 11, courses: 5 },
            { title: 'Web & Distributed Systems', faculty: 4, projects: 15, courses: 6 },
            { title: 'Big Data & Cloud Computing', faculty: 2, projects: 8, courses: 4 },
        ],
        placementStats: [
            { name: 'Amazon', count: 3 },
            { name: 'TCS Digital', count: 18 },
            { name: 'Infosys', count: 25 },
            { name: 'Wipro', count: 12 },
            { name: 'Crest Data Systems', count: 9 }
        ],
        stats: [
            { val: '18', label: 'Faculty Members' },
            { val: '60', label: 'Student Intake' },
            { val: '6', label: 'Laboratories' },
            { val: '1973', label: 'Est. Year' },
        ]
    },
    {
        name: 'Instrumentation & Control Engineering', code: 'IC', established: 1978,
        description: 'Expertise in measurement, control systems, and automation in industrial processes.',
        detailAbout: 'As the core enablers of Industry 4.0, our IC Engineering program dives into highly technical fields combining software, electronics, and mechanical engineering principles. We produce specialists in automated safety systems and precision instrumentation.',
        hod: { name: 'Dr. R. B. Joshi', message: 'Automation is the key to industry 4.0. We specialize in making processes smarter, safer, and more autonomous.' },
        vision: 'To be a premier department in instrumentation and control engineering for technological growth.',
        mission: 'To impart quality education, promote research in automation, and develop problem-solving skills.',
        achievements: ['Advanced Automation & Robotics Lab', 'Instrument Society of India Student Chapter Award', 'MoU with ABB and Siemens'],
        researchAreas: [
            { title: 'Industrial Automation & Robotics', faculty: 3, projects: 8, courses: 4 },
            { title: 'Process Control Systems', faculty: 2, projects: 5, courses: 3 },
            { title: 'Sensor Integration Networks', faculty: 2, projects: 6, courses: 3 },
        ],
        placementStats: [
            { name: 'ABB', count: 10 },
            { name: 'Siemens', count: 8 },
            { name: 'Honeywell', count: 5 },
            { name: 'Yokogawa', count: 4 },
            { name: 'L&T Technology Services', count: 12 }
        ],
        stats: [
            { val: '15', label: 'Faculty Members' },
            { val: '60', label: 'Student Intake' },
            { val: '7', label: 'Laboratories' },
            { val: '1978', label: 'Est. Year' },
        ]
    },
    {
        name: 'Mechanical Engineering', code: 'ME', established: 1983,
        description: 'Innovation in design, manufacturing, thermal engineering, and robotics.',
        detailAbout: 'Mechanical engineering forms the robust backbone of numerous technological marvels. We instruct students in everything from CAD manufacturing models to thermodynamics, utilizing industry-standard technology in heavily outfitted machine shops.',
        hod: { name: 'Dr. K. L. Prajapati', message: 'Mechanical engineering is the foundation of all industries. We build the machines and systems that move the world.' },
        vision: 'To be a center of excellence in mechanical engineering providing sustainable solutions to industry and society.',
        mission: 'To impart knowledge in design and manufacturing, foster research, and develop leadership qualities.',
        achievements: ['Gokart Racing National Winners', 'Advanced CNC & CAD Laboratory', 'Research in Sustainable Manufacturing'],
        researchAreas: [
            { title: 'Thermal & Fluid Engineering', faculty: 4, projects: 10, courses: 5 },
            { title: 'Advanced Manufacturing & Robotics', faculty: 4, projects: 12, courses: 6 },
            { title: 'Design Optimization', faculty: 3, projects: 7, courses: 4 },
        ],
        placementStats: [
            { name: 'Maruti Suzuki', count: 15 },
            { name: 'Tata Motors', count: 10 },
            { name: 'Thermax', count: 6 },
            { name: 'L&T', count: 18 },
            { name: 'MG Motors', count: 8 }
        ],
        stats: [
            { val: '26', label: 'Faculty Members' },
            { val: '120', label: 'Student Intake' },
            { val: '12', label: 'Laboratories' },
            { val: '1983', label: 'Est. Year' },
        ]
    },
    {
        name: 'Power Electronics Engineering', code: 'PE', established: 1988,
        description: 'Specialize in the conversion, control, and conditioning of electric power.',
        detailAbout: 'A specialized discipline at the heart of the modern sustainable push. Our graduates work extensively with power rectifiers, EV propulsion components, and renewable grid integration networks.',
        hod: { name: 'Dr. H. G. Patel', message: 'Power electronics is crucial for electric vehicles and renewable energy. Join us in optimizing power for a greener future.' },
        vision: 'To provide world-class education and research in power electronics and energy conversion.',
        mission: 'To develop competent engineers, promote innovation in power converters, and serve the energy industry.',
        achievements: ['EV Charging Infrastructure Project', 'Industrial Power Quality Consultancy', 'IEEE PE Society Chapter Excellence'],
        researchAreas: [
            { title: 'Electric Vehicle Technologies', faculty: 3, projects: 10, courses: 4 },
            { title: 'Power Converters & Drives', faculty: 2, projects: 6, courses: 3 },
            { title: 'Renewable Power Conditioning', faculty: 2, projects: 5, courses: 3 },
        ],
        placementStats: [
            { name: 'Hitachi Energy', count: 8 },
            { name: 'Schneider Electric', count: 6 },
            { name: 'Ather Energy', count: 5 },
            { name: 'Exide', count: 4 }
        ],
        stats: [
            { val: '14', label: 'Faculty Members' },
            { val: '60', label: 'Student Intake' },
            { val: '5', label: 'Laboratories' },
            { val: '1988', label: 'Est. Year' },
        ]
    },
    {
        name: 'Computer Science and Engineering (Data Science)', code: 'CSE-DS', established: 1993,
        description: 'Focusing on extracting insights from data and building data-driven systems.',
        detailAbout: 'As data expands globally, decoding it guarantees transformative results. Our specialized Data Science track emphasizes natural language processing, predictive modeling, machine learning algorithms, and deep analytics methodologies.',
        hod: { name: 'Dr. S. K. Gupta', message: 'Data is the new oil. In our department, we learn to refine it into actionable intelligence through AI and Big Data.' },
        vision: 'To be a leader in data science education and research, empowering students with data-driven insights.',
        mission: 'To provide deep knowledge in AI and analytics, foster research in data science, and ensure ethical data practices.',
        achievements: ['Kaggle Competition Top Rankers', 'Collaboration with NVIDIA for AI labs', 'Specialized Research on Predictive Analytics'],
        researchAreas: [
            { title: 'Predictive Analytics & Big Data', faculty: 3, projects: 8, courses: 5 },
            { title: 'Deep Learning & Neural Networks', faculty: 2, projects: 7, courses: 4 },
            { title: 'Data Pipeline Engineering', faculty: 2, projects: 5, courses: 3 },
        ],
        placementStats: [
            { name: 'Fractal Analytics', count: 6 },
            { name: 'Mu Sigma', count: 8 },
            { name: 'TCS (Data/Analytics)', count: 12 },
            { name: 'eInfochips', count: 10 }
        ],
        stats: [
            { val: '16', label: 'Faculty Members' },
            { val: '60', label: 'Student Intake' },
            { val: '6', label: 'Laboratories' },
            { val: '1993', label: 'Est. Year' },
        ]
    },
    {
        name: 'Electronics And Instrumentation Engineering', code: 'EI', established: 1998,
        description: 'Combining electronics with instrumentation for precise measurement and control.',
        detailAbout: 'Bridging the divide between circuit design and mechanical action. Our EI framework gives future engineers hands-on tools to deploy IoT networks across traditional manufacturing networks to drive maximum efficiency.',
        hod: { name: 'Dr. P. R. Chavda', message: 'Precision and measurement define progress. We prepare students for the complex world of industrial monitoring and control.' },
        vision: 'To excel in providing quality education in electronics and instrumentation for industrial excellence.',
        mission: 'To impart technical skills, promote innovation in sensor technologies, and develop ethical engineers.',
        achievements: ['Sensor Research Center establishment', 'Gold medalists in GTU Instrumentation', 'Placements in Process Industries'],
        researchAreas: [
            { title: 'Sensor Integration & Deployment', faculty: 3, projects: 6, courses: 4 },
            { title: 'Biomedical Instrumentation', faculty: 2, projects: 4, courses: 3 },
            { title: 'Signal Processing', faculty: 2, projects: 5, courses: 4 },
        ],
        placementStats: [
            { name: 'Bosch', count: 5 },
            { name: 'L&T Controls', count: 8 },
            { name: 'Johnson Controls', count: 6 },
            { name: 'Reliance Industries', count: 10 }
        ],
        stats: [
            { val: '15', label: 'Faculty Members' },
            { val: '60', label: 'Student Intake' },
            { val: '6', label: 'Laboratories' },
            { val: '1998', label: 'Est. Year' },
        ]
    },
    {
        name: 'Information and Communication Technology', code: 'ICT', established: 2003,
        description: 'Integrating telecommunications and computers to manage and communicate information.',
        detailAbout: 'By leveraging the overlap of computer engineering and advanced telecommunication protocols, our ICT sector breeds engineers ready for an interwoven digital lifestyle across global cloud centers and telecom networks.',
        hod: { name: 'Dr. T. M. Parmar', message: 'ICT is the engine of the modern economy. We integrate computing and communication to create powerful information systems.' },
        vision: 'To be a pioneer in ICT education and research, fostering digital innovation for society.',
        mission: 'To provide a multi-disciplinary learning environment, encourage research in telematics, and develop ICT solutions.',
        achievements: ['5G Testbed Development Inclusion', 'Smart City ICT Solutions Project', 'Best Student Chapter Award - CSI'],
        researchAreas: [
            { title: 'Telecommunications & Advanced Networking', faculty: 3, projects: 7, courses: 4 },
            { title: 'Cloud Infrastructure Management', faculty: 2, projects: 8, courses: 4 },
            { title: 'AI in Communications', faculty: 2, projects: 5, courses: 3 },
        ],
        placementStats: [
            { name: 'Jio Platforms', count: 10 },
            { name: 'Airtel', count: 8 },
            { name: 'Cisco Systems', count: 6 },
            { name: 'TCS', count: 12 }
        ],
        stats: [
            { val: '14', label: 'Faculty Members' },
            { val: '60', label: 'Student Intake' },
            { val: '5', label: 'Laboratories' },
            { val: '2003', label: 'Est. Year' },
        ]
    }
];

const seedDepartments = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');

        console.log('Deleting existing departments...');
        await Department.deleteMany({});

        console.log(`Inserting ${DEPARTMENTS_DATA.length} departments...`);
        await Department.insertMany(DEPARTMENTS_DATA);

        console.log('🎉 Departments seeding complete!');
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding departments:', error.message);
        process.exit(1);
    }
};

seedDepartments();
