import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/axios';
import { getAssetUrl } from '../../utils/axios';

const FacultyProfile = () => {
    const { id } = useParams();
    const [faculty, setFaculty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(false);
    const [detailedQualifications, setDetailedQualifications] = useState([]);
    const [detailedAchievements, setDetailedAchievements] = useState([]);
    const [detailedPublications, setDetailedPublications] = useState([]);

    // Fetch faculty data from API
    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const response = await api.get(`/faculty/${id}`);
                setFaculty(response.data);

                const [qualificationsRes, achievementsRes, publicationsRes] = await Promise.allSettled([
                    api.get(`/qualifications/faculty/${id}`),
                    api.get(`/achievements/faculty/${id}`),
                    api.get(`/publications/faculty/${id}`)
                ]);

                if (qualificationsRes.status === 'fulfilled') {
                    setDetailedQualifications(Array.isArray(qualificationsRes.value.data) ? qualificationsRes.value.data : []);
                }
                if (achievementsRes.status === 'fulfilled') {
                    setDetailedAchievements(Array.isArray(achievementsRes.value.data) ? achievementsRes.value.data : []);
                }
                if (publicationsRes.status === 'fulfilled') {
                    setDetailedPublications(Array.isArray(publicationsRes.value.data) ? publicationsRes.value.data : []);
                }
            } catch (err) {
                console.error('Error fetching faculty:', err);
                // Distinguish between network error (backend offline) vs 404
                if (!err.response) {
                    setIsOffline(true);
                } else {
                    setError('Faculty profile not found.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchFaculty();
        }
    }, [id]);

    const indexColors = { SCI: 'bg-green-100 text-green-700', Scopus: 'bg-blue-100 text-blue-700', UGC: 'bg-purple-100 text-purple-700' };

    // Loading state
    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="bg-gradient-to-r from-primary-700 to-primary py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (isOffline || error || !faculty) {
        return (
            <div className="animate-fade-in">
                <div className="bg-gradient-to-r from-primary-700 to-primary py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-3xl font-bold text-white mb-4">Faculty Profile</h1>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
                    {isOffline ? (
                        <div className="inline-flex flex-col items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-10 py-8">
                            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                            <p className="text-amber-800 font-bold text-lg">Backend server is offline</p>
                            <p className="text-amber-600 text-sm">Faculty profiles are loaded from the database. Please start the backend server to view this page.</p>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-lg">{error || 'Faculty profile not found.'}</p>
                    )}
                </div>
            </div>
        );
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const qualifications = detailedQualifications.length > 0 ? detailedQualifications : (faculty?.qualifications || []);
    const achievements = detailedAchievements.length > 0 ? detailedAchievements : (faculty?.achievements || []);
    const publications = detailedPublications.length > 0 ? detailedPublications : (faculty?.publications || []);

    return (
        <div className="animate-fade-in">
            <div className="bg-gradient-to-r from-primary-700 to-primary py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Profile Photo */}
                        <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                            {faculty.profilePhoto ? (
                                <img
                                    src={getAssetUrl(faculty.profilePhoto)}
                                    alt={faculty.name}
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            ) : (
                                <span className="text-white font-bold text-4xl">{faculty.name?.[0]}</span>
                            )}
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white">{faculty.name}</h1>
                            <p className="text-primary-200 font-medium mt-1">{faculty.designation}</p>
                            <p className="text-primary-100 text-sm mt-1">{faculty.department}</p>
                            {faculty.joiningDate && (
                                <p className="text-accent text-xs mt-1 font-bold tracking-wider uppercase">
                                    Faculty Member Since: {formatDate(faculty.joiningDate)}
                                </p>
                            )}
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-primary-100">
                                <span className="flex items-center space-x-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    <span>{faculty.email}</span>
                                </span>
                                {faculty.phone && (
                                    <span className="flex items-center space-x-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        <span>{faculty.phone}</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
                {/* Biography */}
                {faculty.bio && (
                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Biography</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{faculty.bio}</p>
                    </section>
                )}

                {/* Education */}
                {qualifications.length > 0 && (
                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Education</h2>
                        <div className="relative">
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-accent/20"></div>
                            {qualifications.map((edu, i) => (
                                <div key={i} className="relative pl-10 pb-6 last:pb-0">
                                    <div className="absolute left-2.5 top-1.5 w-3 h-3 bg-accent rounded-full border-2 border-white shadow"></div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-primary text-sm">
                                                {edu.degree}
                                                {edu.fieldOfStudy || edu.field ? ` in ${edu.fieldOfStudy || edu.field}` : ''}
                                            </h3>
                                            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">{edu.endYear || edu.year}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{edu.institution}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Specialization & Experience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Specialization</h2>
                        <p className="text-gray-700">{faculty.specialization || 'Not specified'}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Experience</h2>
                        <p className="text-gray-700">{faculty.experience || 'Not specified'}</p>
                    </div>
                </div>

                {/* Research Interests */}
                {faculty.researchInterests && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Research Interests</h2>
                        <p className="text-gray-700">{faculty.researchInterests}</p>
                    </div>
                )}

                {/* Achievements */}
                {achievements.length > 0 && (
                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Achievements & Awards</h2>
                        <div className="space-y-4">
                            {achievements.map((ach, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-lg bg-gray-50/50 border border-gray-100">
                                    <div className="w-10 h-10 shrink-0 bg-accent/10 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{ach.title}</h3>
                                        {ach.date && <p className="text-xs text-primary font-bold mb-1">{typeof ach.date === 'string' ? ach.date : formatDate(ach.date)}</p>}
                                        {ach.description && <p className="text-sm text-gray-600 mt-1">{ach.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Detailed Publications */}
                {publications.length > 0 ? (
                    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                            <span>Publications ({publications.length})</span>
                        </h2>
                        <div className="space-y-4">
                            {publications.map((pub, i) => {
                                const venue = pub.journalName || pub.conferenceName || pub.journal || pub.publisher;
                                const link = pub.link || (pub.doi ? (pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`) : '');
                                const year = pub.publicationDate ? new Date(pub.publicationDate).getFullYear() : pub.year;

                                return (
                                <div key={i} className="p-4 rounded-lg border border-gray-100 hover:border-primary/20 hover:shadow-md transition bg-white">
                                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2">{pub.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs text-gray-500 font-medium space-x-2">
                                            <span className="text-primary bg-primary/5 px-2 py-1 rounded">{venue}</span>
                                            <span className="bg-gray-100 px-2 py-1 rounded">{year}</span>
                                        </div>
                                        {link && (
                                            <a href={link} target="_blank" rel="noreferrer" className="text-accent hover:text-primary transition p-2 bg-slate-50 rounded-full inline-flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )})}
                        </div>
                    </section>
                ) : (
                    faculty.publicationsCount > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                Publications ({faculty.publicationsCount})
                            </h2>
                            <p className="text-gray-500">View detailed publications in the faculty portal.</p>
                        </div>
                    )
                )}

                {/* Contact Info */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-gray-900">{faculty.email}</p>
                        </div>
                        {faculty.phone && (
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="text-gray-900">{faculty.phone}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacultyProfile;

