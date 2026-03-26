export const DEPARTMENTS = [
    'Chemical Engineering',
    'Computer Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Electronics & Communication Engineering',
    'Information Technology',
    'Instrumentation & Control Engineering',
    'Mechanical Engineering',
    'Power Electronics Engineering',
    'Computer Science and Engineering (Data Science)',
    'Electronics And Instrumentation Engineering',
    'Information and Communication Technology'
];

export const ALL_DEPARTMENTS = [...DEPARTMENTS, 'All'];

export const DEPARTMENT_DETAILS = [
    {
        id: 'ch', name: 'Chemical Engineering', code: 'CH',
        description: 'Focusing on the design and operation of chemical plants and methods of improving production.',
        hod: { name: 'Dr. A. K. Shah', message: 'Welcome to the Chemical Engineering Department. We focus on bridging the gap between chemistry and engineering to solve real-world industrial problems.' },
        vision: 'To provide high-quality education and research in chemical engineering and develop leaders for sustainable development.',
        mission: 'Excellence in teaching and research, fostering industry-academia partnership, and instilling social responsibility.',
        achievements: ['NBA Accredited', 'Top placements in ONGC and Reliance', '15+ Research publications this year']
    },
    {
        id: 'cp', name: 'Computer Engineering', code: 'CP',
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
        id: 'cl', name: 'Civil Engineering', code: 'CL',
        description: 'Building the future with sustainable infrastructure, structural design, and urban planning.',
        hod: { name: 'Dr. V. P. Patel', message: 'Civil engineering is the backbone of infrastructure. Our mission is to build safer and more sustainable cities for the future.' },
        vision: 'To become a center of excellence in civil engineering education and research for human development.',
        mission: 'To produce competent civil engineers, develop innovative technologies, and provide professional services to the society.',
        achievements: ['Excellence Award in Structural Design 2024', 'Consultancy projects for Gujarat Govt', 'Specialized Concrete Tech Lab']
    },
    {
        id: 'ee', name: 'Electrical Engineering', code: 'EE',
        description: 'Powering innovation in electrical systems, renewable energy, and smart grid technologies.',
        hod: { name: 'Dr. S. R. Mehta', message: 'We are at the forefront of the renewable energy revolution. Our students learn to power the world efficiently and sustainably.' },
        vision: 'To empower students with advanced knowledge and skills in electrical engineering to meet global challenges.',
        mission: 'To provide quality education, promote research in energy systems, and nurture professional ethics.',
        achievements: ['Smart Grid Research Grant', 'State-of-the-art High Voltage Lab', 'First prize in Power-Tech Expo']
    },
    {
        id: 'ec', name: 'Electronics & Communication Engineering', code: 'EC',
        description: 'Excellence in electronics, VLSI design, and communication systems.',
        hod: { name: 'Dr. M. N. Singh', message: 'Communication connects the world. We prepare our students for the 5G and IoT era with hands-on technical skills.' },
        vision: 'To achieve global recognition in electronics and communication engineering education and research.',
        mission: 'To impart technical knowledge, foster innovation in VLSI and embedded systems, and develop entrepreneurial skills.',
        achievements: ['VLSI Design Center Establishment', 'Patent for Low-power Communication System', 'Placement in Intel and Qualcomm']
    },
    {
        id: 'it', name: 'Information Technology', code: 'IT',
        description: 'Shaping the digital world with solutions in web technologies, cybersecurity, and data analytics.',
        hod: { name: 'Dr. J. S. Dave', message: 'The digital transformation is here. We guide our students to become architects of the next-generation digital ecosystem.' },
        vision: 'To produce innovative IT professionals who contribute to global technological advancements.',
        mission: 'To provide a strong foundation in IT, encourage lifelong learning, and promote ethical use of technology.',
        achievements: ['Cyber Security Excellence Hub', 'Top-tier results in GTU examinations', 'Industry collaborations for Data Analytics']
    },
    {
        id: 'ic', name: 'Instrumentation & Control Engineering', code: 'IC',
        description: 'Expertise in measurement, control systems, and automation in industrial processes.',
        hod: { name: 'Dr. R. B. Joshi', message: 'Automation is the key to industry 4.0. We specialize in making processes smarter, safer, and more autonomous.' },
        vision: 'To be a premier department in instrumentation and control engineering for technological growth.',
        mission: 'To impart quality education, promote research in automation, and develop problem-solving skills.',
        achievements: ['Advanced Automation & Robotics Lab', 'Instrument Society of India Student Chapter Award', 'MoU with ABB and Siemens']
    },
    {
        id: 'me', name: 'Mechanical Engineering', code: 'ME',
        description: 'Innovation in design, manufacturing, thermal engineering, and robotics.',
        hod: { name: 'Dr. K. L. Prajapati', message: 'Mechanical engineering is the foundation of all industries. We build the machines and systems that move the world.' },
        vision: 'To be a center of excellence in mechanical engineering providing sustainable solutions to industry and society.',
        mission: 'To impart knowledge in design and manufacturing, foster research, and develop leadership qualities.',
        achievements: ['Gokart Racing National Winners', 'Advanced CNC & CAD Laboratory', 'Research in Sustainable Manufacturing']
    },
    {
        id: 'pe', name: 'Power Electronics Engineering', code: 'PE',
        description: 'Specialize in the conversion, control, and conditioning of electric power.',
        hod: { name: 'Dr. H. G. Patel', message: 'Power electronics is crucial for electric vehicles and renewable energy. Join us in optimizing power for a greener future.' },
        vision: 'To provide world-class education and research in power electronics and energy conversion.',
        mission: 'To develop competent engineers, promote innovation in power converters, and serve the energy industry.',
        achievements: ['EV Charging Infrastructure Project', 'Industrial Power Quality Consultancy', 'IEEE PE Society Chapter Excellence']
    },
    {
        id: 'cseds', name: 'Computer Science and Engineering (Data Science)', code: 'CSE-DS',
        description: 'Focusing on extracting insights from data and building data-driven systems.',
        hod: { name: 'Dr. S. K. Gupta', message: 'Data is the new oil. In our department, we learn to refine it into actionable intelligence through AI and Big Data.' },
        vision: 'To be a leader in data science education and research, empowering students with data-driven insights.',
        mission: 'To provide deep knowledge in AI and analytics, foster research in data science, and ensure ethical data practices.',
        achievements: ['Kaggle Competition Top Rankers', 'Collaboration with NVIDIA for AI labs', 'Specialized Research on Predictive Analytics']
    },
    {
        id: 'ei', name: 'Electronics And Instrumentation Engineering', code: 'EI',
        description: 'Combining electronics with instrumentation for precise measurement and control.',
        hod: { name: 'Dr. P. R. Chavda', message: 'Precision and measurement define progress. We prepare students for the complex world of industrial monitoring and control.' },
        vision: 'To excel in providing quality education in electronics and instrumentation for industrial excellence.',
        mission: 'To impart technical skills, promote innovation in sensor technologies, and develop ethical engineers.',
        achievements: ['Sensor Research Center establishment', 'Gold medalists in GTU Instrumentation', 'Placements in Process Industries']
    },
    {
        id: 'ict', name: 'Information and Communication Technology', code: 'ICT',
        description: 'Integrating telecommunications and computers to manage and communicate information.',
        hod: { name: 'Dr. T. M. Parmar', message: 'ICT is the engine of the modern economy. We integrate computing and communication to create powerful information systems.' },
        vision: 'To be a pioneer in ICT education and research, fostering digital innovation for society.',
        mission: 'To provide a multi-disciplinary learning environment, encourage research in telematics, and develop ICT solutions.',
        achievements: ['5G Testbed Development Inclusion', 'Smart City ICT Solutions Project', 'Best Student Chapter Award - CSI']
    }
];
