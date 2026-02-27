import { Link } from 'react-router-dom';

const Footer = () => (
    <footer className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* About */}
                <div className="md:col-span-1">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                            <span className="font-bold text-lg">CP</span>
                        </div>
                        <span className="font-bold text-xl">College Portal</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                        Empowering education through technology. A comprehensive platform for academic excellence and departmental management.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="font-semibold text-lg mb-4 text-accent-200">Quick Links</h3>
                    <ul className="space-y-2">
                        {['Departments', 'Faculty', 'Notices', 'Events', 'Calendar'].map(item => (
                            <li key={item}>
                                <Link to={`/${item.toLowerCase()}`} className="text-gray-300 hover:text-accent transition text-sm">
                                    {item}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="font-semibold text-lg mb-4 text-accent-200">Contact Us</h3>
                    <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex items-start space-x-2">
                            <svg className="w-4 h-4 mt-0.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span>123 College Avenue, Education City, State - 560001</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span>info@collegeportal.edu</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <span>+91 80 1234 5678</span>
                        </li>
                    </ul>
                </div>

                {/* Office Hours */}
                <div>
                    <h3 className="font-semibold text-lg mb-4 text-accent-200">Office Hours</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li>Monday - Friday: 9:00 AM - 5:00 PM</li>
                        <li>Saturday: 9:00 AM - 1:00 PM</li>
                        <li>Sunday: Closed</li>
                    </ul>
                    <div className="flex space-x-3 mt-4">
                        {['facebook', 'twitter', 'linkedin'].map(social => (
                            <a key={social} href="#" className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center hover:bg-accent transition">
                                <span className="text-xs text-white font-bold">{social[0].toUpperCase()}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-primary-700 mt-8 pt-8 text-center text-sm text-gray-400">
                <p>© {new Date().getFullYear()} College Portal. All rights reserved. Built with ❤️ for education.</p>
            </div>
        </div>
    </footer>
);

export default Footer;
