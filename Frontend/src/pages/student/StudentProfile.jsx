import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import { FiPhone, FiMapPin, FiUser, FiInfo, FiMail, FiLayers, FiShield, FiSave, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const StudentProfile = () => {
    const [student, setStudent] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('user') || 'null'); } catch { return null; }
    });
    const [form, setForm] = useState({ phone: '', address: '', guardianName: '', guardianContact: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const { data } = await api.get('/student-auth/me');
                setStudent(data);
            } catch (err) {
                console.error('Failed to fetch student profile', err);
            }
        };
        fetchMe();
    }, []);

    useEffect(() => {
        if (student) {
            setForm({
                phone: student.phone || '',
                address: student.address || '',
                guardianName: student.guardianName || '',
                guardianContact: student.guardianContact || '',
            });
        }
    }, [student]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await api.patch('/student/profile', form);
            setStudent(data.student);
            sessionStorage.setItem('user', JSON.stringify(data.student));
            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Update failed.');
        } finally {
            setSaving(false);
        }
    };

    const fields = [
        { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: '9876543210', icon: FiPhone },
        { name: 'address', label: 'Residential Address', type: 'text', placeholder: '123 Main St, Ahmedabad', icon: FiMapPin },
        { name: 'guardianName', label: 'Guardian Name', type: 'text', placeholder: "Guardian's full name", icon: FiUser },
        { name: 'guardianContact', label: 'Guardian Contact Number', type: 'tel', placeholder: '9876543210', icon: FiPhone },
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ══════ STUDENT CARD CARD (Left Column) ══════ */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="relative overflow-hidden bg-gradient-to-br from-primary-900 to-primary-700 rounded-3xl text-white shadow-xl shadow-primary-950/20 border border-primary-800/80 p-6 flex flex-col items-center text-center group">
                        {/* Ambient light glow */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>

                        {/* Profile Initials Circle */}
                        <div className="relative z-10 w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-4xl font-extrabold text-white shadow-inner mb-4 tracking-tight group-hover:scale-105 transition-transform duration-500">
                            {student?.name?.[0]?.toUpperCase() || '?'}
                            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-primary-900 flex items-center justify-center">
                                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                            </div>
                        </div>

                        <h2 className="relative z-10 font-heading font-black text-xl tracking-tight leading-tight">{student?.name}</h2>
                        <p className="relative z-10 text-[11px] font-bold text-accent-300 uppercase tracking-widest mt-1">Student Portal</p>
                        
                        <div className="relative z-10 w-full mt-6 pt-6 border-t border-white/10 space-y-3.5 text-left text-xs">
                            <div className="flex items-center justify-between text-primary-100">
                                <span className="font-semibold flex items-center gap-1.5"><FiLayers className="opacity-75" /> Department</span>
                                <span className="text-white font-bold">{student?.department}</span>
                            </div>
                            <div className="flex items-center justify-between text-primary-100">
                                <span className="font-semibold flex items-center gap-1.5"><FiInfo className="opacity-75" /> Enrollment No.</span>
                                <span className="text-white font-bold">{student?.enrollmentNo}</span>
                            </div>
                            <div className="flex items-center justify-between text-primary-100">
                                <span className="font-semibold flex items-center gap-1.5"><FiShield className="opacity-75" /> Semester</span>
                                <span className="text-white font-bold">Semester {student?.semester}</span>
                            </div>
                            {student?.division && (
                                <div className="flex items-center justify-between text-primary-100">
                                    <span className="font-semibold flex items-center gap-1.5"><FiInfo className="opacity-75" /> Division</span>
                                    <span className="text-white font-bold">Div {student.division}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Read-Only Details Segment */}
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-6 shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FiInfo /> Account Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Official Email</span>
                                <div className="flex items-center gap-2 text-sm text-gray-800 font-semibold bg-gray-50 border border-gray-100 px-3.5 py-2.5 rounded-xl">
                                    <FiMail className="text-gray-400 shrink-0" />
                                    <span className="truncate">{student?.email}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-amber-50/50 border border-amber-100/80 rounded-2xl flex items-start gap-2.5">
                                <FiAlertCircle className="text-amber-600 shrink-0 mt-0.5 w-4 h-4" />
                                <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                    To update your official details (Name, Enrollment No, Division, Sem), please raise a request to the admin department.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════ PROFILE UPDATE FORM (Right Column) ══════ */}
                <div className="lg:col-span-2">
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200/60 rounded-3xl p-8 shadow-sm h-full flex flex-col">
                        <div className="mb-8 border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight font-heading">Personal Information</h2>
                            <p className="text-sm text-gray-400 font-medium mt-1">Keep your communication and emergency contact info up-to-date.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col justify-between" id="student-profile-form">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {fields.map(f => {
                                    const IconComponent = f.icon;
                                    return (
                                        <div key={f.name} className={f.name === 'address' ? 'md:col-span-2' : ''}>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{f.label}</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                                                    <IconComponent className="w-4 h-4" />
                                                </div>
                                                <input
                                                    type={f.type}
                                                    name={f.name}
                                                    value={form[f.name]}
                                                    onChange={handleChange}
                                                    placeholder={f.placeholder}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-white/50 focus:bg-white focus:border-primary rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary/5"
                                                    id={`profile-${f.name}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-8 border-t border-gray-100 mt-8">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white font-extrabold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:bg-primary-800 active:scale-95 transition-all duration-300 disabled:opacity-60"
                                    id="profile-save-btn"
                                >
                                    <FiSave className="w-4 h-4" />
                                    {saving ? 'Saving Changes...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
