import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube } from 'react-icons/fa';
import vgec_hd from '../assets/vgec_hd.png';
import api from '../utils/axios';

const socialIcons = {
    facebook: <FaFacebook size={14} />,
    twitter: <FaTwitter size={14} />,
    linkedin: <FaLinkedin size={14} />,
    instagram: <FaInstagram size={14} />,
    youtube: <FaYoutube size={14} />,
};

const socialLinks = {
    facebook: 'https://www.facebook.com/Official.Vgec',
    twitter: 'https://x.com/OfficialVgec',
    linkedin: 'https://www.linkedin.com/school/vishwakarma-government-engineering-college-chandkheda-gandhinagar-017',
    instagram: 'https://www.instagram.com/vgec.official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
    youtube: 'https://youtube.com/@vgecchandkhedaofficial6895?si=zcy6J52a3hbvT4jO'
};

const VISITOR_STORAGE_KEY = 'vgec_visitor_counted';

const Footer = () => {
    const [visitorCount, setVisitorCount] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const syncVisitorCount = async () => {
            try {
                const hasCountedVisitor = localStorage.getItem(VISITOR_STORAGE_KEY) === 'true';

                if (!hasCountedVisitor) {
                    const { data } = await api.post('/settings/visitor-count');
                    if (isMounted) {
                        setVisitorCount(data.visitorCount || 0);
                    }
                    localStorage.setItem(VISITOR_STORAGE_KEY, 'true');
                    return;
                }

                const { data } = await api.get('/settings/visitor-count');
                if (isMounted) {
                    setVisitorCount(data.visitorCount || 0);
                }
            } catch (error) {
                console.error('Failed to load visitor count:', error);
            }
        };

        syncVisitorCount();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <footer className="bg-primary-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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

                    <div>
                        <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            {[
                                { label: 'Faculty', to: '/faculty' },
                                { label: 'Notices', to: '/notices' },
                                { label: 'GTU Circulars', to: '/gtu-circulars' },
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

                    <div>
                        <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
                        <ul className="space-y-2.5 text-sm text-primary-200">
                            <li className="flex items-start space-x-2">
                                <svg className="w-4 h-4 mt-0.5 text-primary-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <span className="text-xs"> <a  href="https://maps.app.goo.gl/qTYvtYS3hjCPVgnMA"  className="text-xs hover:underline"> Nr. Visat Three Roads, Sabarmati-Koba Highway, Chandkheda, Ahmedabad-382424 </a> </span>
                            </li>
                            <li className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-primary-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                <span className="text-xs"> <a  href="mailto:est@vgecg.ac.in"  className="text-xs hover:underline">  est@vgecg.ac.in </a>
                                </span>
                            </li>   
                            <li className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-primary-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                <span className="text-xs">(079) 23293866</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">Resources</h3>
                        <ul className="space-y-2 text-sm text-primary-200 mb-4">
                            
                            <li><a href="https://vgecg.ac.in" target="_blank" rel="noreferrer" className="hover:text-white transition text-xs">VGEC Official Website ↗</a></li>
                            <li><a href="https://www.gtu.ac.in" target="_blank" rel="noreferrer" className="hover:text-white transition text-xs">GTU Portal ↗</a></li>
                            <li><a href="https://www.aicte-india.org" target="_blank" rel="noreferrer" className="hover:text-white transition text-xs">AICTE ↗</a></li>
                        </ul>
                        
                        <div className="flex space-x-2 mt-4">
                            {Object.entries(socialLinks).map(([social, url]) => (
                                <a
                                    key={social}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-7 h-7 bg-primary-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition text-primary-200 hover:text-white"
                                    aria-label={social}
                                >
                                    {socialIcons[social]}
                                </a>
                            ))}
                        </div>

                         <div className="inline-flex items-center my-6 gap-2 rounded-md bg-blue-900 px-3 py-1 shadow-sm">
                            <span className="font-bold tracking-[0.20em] text-[8px] text-primary-200 uppercase">Visitors</span>
                            <span className="text-sm font-semibold text-white">
                                {visitorCount === null ? 'Loading...' : visitorCount.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-primary-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-primary-300">
                    <p>© {new Date().getFullYear()} Department of Computer Engineering, Vishwakarma Government Engineering College, Ahmedabad</p>
                    <div className="flex flex-col items-center md:items-end mt-4 md:mt-0 space-y-2">
                        <p>GTU Affiliated · AICTE Approved · Estd. 2001</p>
                       
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
