import { useState } from 'react';
import toast from 'react-hot-toast';

const leaveHistory = [
    { id: 1, type: 'CL', from: '2026-01-10', to: '2026-01-11', reason: 'Personal work', status: 'Approved', remarks: 'Approved. Please arrange substitute.', document: false },
    { id: 2, type: 'OD', from: '2026-02-05', to: '2026-02-05', reason: 'Guest lecture at NIT Trichy', status: 'Approved', remarks: 'Approved.', document: true },
    { id: 3, type: 'ML', from: '2026-02-15', to: '2026-02-20', reason: 'Medical treatment', status: 'Rejected', remarks: 'Please submit medical certificate.', document: false },
    { id: 4, type: 'CL', from: '2026-03-05', to: '2026-03-06', reason: 'Family function', status: 'Pending', remarks: '', document: false },
];

const leaveBalance = [
    { type: 'CL (Casual Leave)', total: 12, used: 4, balance: 8, color: 'bg-blue-500' },
    { type: 'ML (Medical Leave)', total: 10, used: 2, balance: 8, color: 'bg-green-500' },
    { type: 'OD (On Duty)', total: 15, used: 3, balance: 12, color: 'bg-purple-500' },
    { type: 'Special Leave', total: 5, used: 0, balance: 5, color: 'bg-orange-500' },
];

const statusColors = { Approved: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700', Pending: 'bg-yellow-100 text-yellow-700' };

const LeaveApplication = () => {
    const [form, setForm] = useState({ type: 'CL', from: '', to: '', reason: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.from || !form.to || !form.reason) { toast.error('Please fill all required fields.'); return; }
        if (new Date(form.from) > new Date(form.to)) { toast.error('End date must be after start date.'); return; }
        toast.success('Leave application submitted!');
        setForm({ type: 'CL', from: '', to: '', reason: '' });
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Leave Application</h1>
                <p className="text-gray-500 text-sm mt-1">Apply for leave and track your leave history.</p>
            </div>

            {/* Leave Balance Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {leaveBalance.map((lb, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                        <p className="text-xs text-gray-500 font-medium mb-2">{lb.type}</p>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-bold text-gray-900">{lb.balance}</span>
                            <span className="text-xs text-gray-400">{lb.used}/{lb.total} used</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                            <div className={`${lb.color} h-1.5 rounded-full`} style={{ width: `${(lb.used / lb.total) * 100}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Application Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">New Leave Application</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
                        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none bg-white">
                            {['CL', 'ML', 'OD', 'Special'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div></div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date *</label>
                        <input type="date" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date *</label>
                        <input type="date" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                        <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none resize-none" placeholder="Describe the reason for leave..." />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Document (Optional)</label>
                        <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent/10 file:text-accent hover:file:bg-accent/20" />
                    </div>
                    <div className="md:col-span-2">
                        <button type="submit" className="bg-primary text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary/25">Submit Application</button>
                    </div>
                </form>
            </div>

            {/* Leave History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100"><h2 className="text-lg font-bold text-gray-900">Leave History</h2></div>
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">From</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">To</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Reason</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">HOD Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaveHistory.map((l, i) => (
                            <tr key={l.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition`}>
                                <td className="px-6 py-3"><span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">{l.type}</span></td>
                                <td className="px-6 py-3 text-sm text-gray-600">{l.from}</td>
                                <td className="px-6 py-3 text-sm text-gray-600">{l.to}</td>
                                <td className="px-6 py-3 text-sm text-gray-600 max-w-xs truncate">{l.reason}</td>
                                <td className="px-6 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[l.status]}`}>{l.status}</span></td>
                                <td className="px-6 py-3 text-sm text-gray-500 italic">{l.remarks || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaveApplication;
