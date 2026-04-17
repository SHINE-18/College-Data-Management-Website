import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/axios';

const statusColors = { Approved: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700', Pending: 'bg-yellow-100 text-yellow-700' };

const LeaveApprovals = () => {
    const [leaves, setLeaves] = useState([]);
    const [remarks, setRemarks] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const response = await api.get('/leaves/pending');
            setLeaves(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Failed to fetch pending leaves', error);
            toast.error('Failed to load leave requests');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (leaveId, action, facultyName) => {
        const remark = remarks[leaveId]?.trim() || '';

        if (action === 'reject' && !remark) {
            toast.error('Please add remarks before rejecting.');
            return;
        }

        try {
            await api.put(`/leaves/${leaveId}/${action}`, { remarks: remark || 'Approved by HOD' });
            toast.success(`Leave ${action === 'approve' ? 'approved' : 'rejected'} for ${facultyName}`);
            setRemarks((prev) => ({ ...prev, [leaveId]: '' }));
            fetchLeaves();
        } catch (error) {
            console.error(`Failed to ${action} leave`, error);
            toast.error(error.response?.data?.message || `Failed to ${action} leave`);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Leave Approvals</h1>
                <p className="text-gray-500 text-sm mt-1">Review and approve or reject leave applications from faculty.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Faculty</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">From</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">To</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Reason</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Remarks</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-400">Loading leave requests...</td></tr>
                            ) : leaves.length > 0 ? (
                                leaves.map((leave, index) => (
                                    <tr key={leave._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{leave.facultyName}</td>
                                        <td className="px-6 py-3"><span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{leave.leaveType}</span></td>
                                        <td className="px-6 py-3 text-sm text-gray-600">{new Date(leave.startDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-3 text-sm text-gray-600">{new Date(leave.endDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-3 text-sm text-gray-600 max-w-xs"><div className="truncate">{leave.reason}</div></td>
                                        <td className="px-6 py-3">
                                            <input
                                                value={remarks[leave._id] || ''}
                                                onChange={(e) => setRemarks({ ...remarks, [leave._id]: e.target.value })}
                                                placeholder="Add remarks..."
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-accent outline-none"
                                            />
                                        </td>
                                        <td className="px-6 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[leave.status]}`}>{leave.status}</span></td>
                                        <td className="px-6 py-3">
                                            <div className="flex space-x-1">
                                                <button onClick={() => handleAction(leave._id, 'approve', leave.facultyName)} className="bg-green-500 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-green-600 transition">Approve</button>
                                                <button onClick={() => handleAction(leave._id, 'reject', leave.facultyName)} className="bg-red-500 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-red-600 transition">Reject</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-400">No pending leave requests.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LeaveApprovals;
