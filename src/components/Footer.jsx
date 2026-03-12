import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube } from 'react-icons/fa';
import vgec_hd from '../assets/vgec_hd.png';

const socialIcons = {
    facebook: <FaFacebook size={14} />,
    twitter: <FaTwitter size={14} />,
    linkedin: <FaLinkedin size={14} />,
    instagram: <FaInstagram size={14} />,
    youtube: <FaYoutube size={14} />,
};

const Footer = () => (
    <footer className="bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Department Info */}
                <div className="md:col-span-1">
                    <div className="flex items-center space-x-3 mb-4">
                        <img src={vgec_hd} alt="VGEC Logo" className="w-12 h-12 object-contain" />
                        <div>
                            <span className="font-heading font-bold text-sm uppercase tracking-wider block leading-tight">Dept. of Computer Engineering</span>
                            <span className="text-primary-200 text-xs">VGEC, Ahmedabad</span>
                        </div>
                    </div>
                    <p className="text-primary-200 text-xs leading-relaxed">
                        Affiliated to Gujarat Technological University (GTU). Approved by AICTE. Established 2001.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        {[
                            { label: 'Faculty', to: '/faculty' },
                            { label: 'Notices', to: '/notices' },
                            { label: 'Events', to: '/events' },
                            { label: 'Timetable', to: '/timetable' },
                            { label: 'Academic Calendar', to: '/calendar' },
                        ].map(item => (
                            <li key={item.label}>
                                <Link to={item.to} className="text-primary-200 hover:text-white transition text-sm">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
                    <ul className="space-y-2.5 text-sm text-primary-200">
                        <li className="flex items-start space-x-2">
                            <svg className="w-4 h-4 mt-0.5 text-primary-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="text-xs">Nr. Visat Three Roads, Sabarmati-Koba Highway, Chandkheda, Ahmedabad-382424</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-primary-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span className="text-xs">est@vgecg.ac.in</span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-primary-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <span className="text-xs">(079) 23293866</span>
                        </li>
                    </ul>
                </div>

                {/* External Links & Social */}
                <div>
                    <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">Resources</h3>
                    <ul className="space-y-2 text-sm text-primary-200 mb-4">
                        <li><a href="https://vgecg.ac.in" target="_blank" rel="noreferrer" className="hover:text-white transition text-xs">VGEC Official Website ↗</a></li>
                        <li><a href="https://www.gtu.ac.in" target="_blank" rel="noreferrer" className="hover:text-white transition text-xs">GTU Portal ↗</a></li>
                        <li><a href="https://www.aicte-india.org" target="_blank" rel="noreferrer" className="hover:text-white transition text-xs">AICTE ↗</a></li>
                    </ul>
                    <div className="flex space-x-2 mt-4">
                        {['facebook', 'twitter', 'linkedin', 'instagram', 'youtube'].map(social => (
                            <a key={social} href="#" className="w-7 h-7 bg-primary-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition text-primary-200 hover:text-white" aria-label={social}>
                                {socialIcons[social]}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-primary-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-primary-300">
                <p>© {new Date().getFullYear()} Department of Computer Engineering, Vishwakarma Government Engineering College, Ahmedabad</p>
                <p className="mt-2 md:mt-0">GTU Affiliated · AICTE Approved · Estd. 2001</p>
            </div>
        </div>
    </footer>
);

export default Footer;
