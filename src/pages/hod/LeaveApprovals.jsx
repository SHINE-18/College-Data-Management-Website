import { useState } from 'react';
import toast from 'react-hot-toast';

const initialLeaves = [
    { id: 1, faculty: 'Prof. Amit Joshi', type: 'CL', from: '2026-03-05', to: '2026-03-06', reason: 'Personal work — family function in hometown.', status: 'Pending' },
    { id: 2, faculty: 'Dr. Kavita Nair', type: 'OD', from: '2026-03-10', to: '2026-03-10', reason: 'Attending International Conference on Cybersecurity at IIT Hyderabad.', status: 'Pending' },
    { id: 3, faculty: 'Prof. Deepak Rao', type: 'ML', from: '2026-03-12', to: '2026-03-15', reason: 'Medical checkup and minor procedure.', status: 'Pending' },
    { id: 4, faculty: 'Dr. Pooja Mehta', type: 'CL', from: '2026-03-20', to: '2026-03-20', reason: 'Child\'s school event.', status: 'Pending' },
];

const statusColors = { Approved: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700', Pending: 'bg-yellow-100 text-yellow-700' };

const LeaveApprovals = () => {
    const [leaves, setLeaves] = useState(initialLeaves);
    const [remarks, setRemarks] = useState({});

    const handleAction = (id, action) => {
        const remark = remarks[id] || '';
        if (!remark && action === 'Rejected') { toast.error('Please add remarks before rejecting.'); return; }
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: action, remarks: remark } : l));
        toast.success(`Leave ${action.toLowerCase()} for ${leaves.find(l => l.id === id)?.faculty}`);
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Leave Approvals</h1>
                <p className="text-gray-500 text-sm mt-1">Review and approve/reject leave applications from faculty.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
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
                        {leaves.map((l, i) => (
                            <tr key={l.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                <td className="px-6 py-3 text-sm font-medium text-gray-900">{l.faculty}</td>
                                <td className="px-6 py-3"><span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{l.type}</span></td>
                                <td className="px-6 py-3 text-sm text-gray-600">{l.from}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{l.to}</td>
                                <td className="px-6 py-3 text-sm text-gray-600 max-w-xs"><div className="truncate">{l.reason}</div></td>
                                <td className="px-6 py-3">
                                    {l.status === 'Pending' ? (
                                        <input value={remarks[l.id] || ''} onChange={e => setRemarks({ ...remarks, [l.id]: e.target.value })} placeholder="Add remarks..." className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-accent outline-none" />
                                    ) : (
                                        <span className="text-xs text-gray-500 italic">{l.remarks || '—'}</span>
                                    )}
                                </td>
                                <td className="px-6 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[l.status]}`}>{l.status}</span></td>
                                <td className="px-6 py-3">
                                    {l.status === 'Pending' ? (
                                        <div className="flex space-x-1">
                                            <button onClick={() => handleAction(l.id, 'Approved')} className="bg-green-500 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-green-600 transition">Approve</button>
                                            <button onClick={() => handleAction(l.id, 'Rejected')} className="bg-red-500 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-red-600 transition">Reject</button>
                                        </div>
                                    ) : <span className="text-xs text-gray-400">Done</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaveApprovals;
