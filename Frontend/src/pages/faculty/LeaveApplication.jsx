import { useState, useEffect } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const leaveTypeOptions = ['Casual Leave', 'Sick Leave', 'Earned Leave', 'Medical Emergency', 'Other'];
const statusColors = {
    Approved: 'bg-green-100 text-green-700',
    Rejected: 'bg-red-100 text-red-700',
    Pending: 'bg-yellow-100 text-yellow-700',
};

const LeaveApplication = () => {
    const [form, setForm] = useState({ leaveType: 'Casual Leave', startDate: '', endDate: '', reason: '' });
    const [leaveHistory, setLeaveHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLeaveData();
    }, []);

    const fetchLeaveData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/leaves');
            setLeaveHistory(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Error loading leaves:', err);
            toast.error('Error loading leave data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.startDate || !form.endDate || !form.reason) {
            toast.error('Please fill all required fields.');
            return;
        }
        if (new Date(form.startDate) > new Date(form.endDate)) {
            toast.error('End date must be after start date.');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/leaves', form);
            toast.success('Leave application submitted!');
            setForm({ leaveType: 'Casual Leave', startDate: '', endDate: '', reason: '' });
            fetchLeaveData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error submitting leave application');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Leave Application</h1>
                <p className="text-gray-500 text-sm mt-1">Apply for leave and track your leave history.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">New Leave Application</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
                        <select
                            value={form.leaveType}
                            onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white"
                        >
                            {leaveTypeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div></div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date *</label>
                        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date *</label>
                        <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                        <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none resize-none" placeholder="Describe the reason for leave..." />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" disabled={submitting} className="bg-primary text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed">
                            {submitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">Leave History</h2></div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">From</th>
                                <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">To</th>
                                <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Reason</th>
                                <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left px-4 md:px-6 py-3 text-xs font-semibold text-gray-500 uppercase">HOD Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="px-4 md:px-6 py-3 text-center text-gray-500">Loading...</td></tr>
                            ) : leaveHistory.length > 0 ? (
                                leaveHistory.map((leave, index) => (
                                    <tr key={leave._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                        <td className="px-4 md:px-6 py-3"><span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{leave.leaveType}</span></td>
                                        <td className="px-4 md:px-6 py-3 text-sm text-gray-600">{new Date(leave.startDate).toLocaleDateString('en-IN')}</td>
                                        <td className="px-4 md:px-6 py-3 text-sm text-gray-600">{new Date(leave.endDate).toLocaleDateString('en-IN')}</td>
                                        <td className="px-4 md:px-6 py-3 text-sm text-gray-600 max-w-xs truncate">{leave.reason}</td>
                                        <td className="px-4 md:px-6 py-3">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[leave.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {leave.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-6 py-3 text-sm text-gray-500 italic">{leave.remarks || '—'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="px-4 md:px-6 py-3 text-center text-gray-500">No leave applications</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaveApplication;
