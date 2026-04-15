// ============================================
// pages/Feedback.jsx — Public Feedback & Grievance Form
// ============================================

import { useState } from 'react';
import api from '../utils/axios';

const CATEGORIES = ['General', 'Academic', 'Infrastructure', 'Faculty', 'Administration', 'Other'];

const Feedback = () => {
    const [form, setForm] = useState({
        type: 'feedback',
        category: 'General',
        message: '',
        isAnonymous: false,
        department: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.message.trim().length < 10) { setError('Please write at least 10 characters.'); return; }
        setError('');
        setSubmitting(true);
        try {
            await api.post('/feedback', form);
            setSubmitted(true);
        } catch (err) {
            setError(err?.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Your feedback has been submitted successfully and will be reviewed by the administration.</p>
                    <button onClick={() => { setSubmitted(false); setForm({ type: 'feedback', category: 'General', message: '', isAnonymous: false, department: '' }); }}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition">
                        Submit Another
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero */}
            <div className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-14 px-4 text-center">
                <h1 className="text-3xl font-bold mb-2">Feedback & Grievance</h1>
                <p className="text-primary-200">Your voice matters. Share your feedback anonymously or with your identity.</p>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-10">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-5" id="feedback-form">
                        {/* Type */}
                        <div className="grid grid-cols-2 gap-3">
                            {['feedback', 'grievance'].map(t => (
                                <label key={t} className={`cursor-pointer border-2 rounded-xl p-4 text-center transition ${form.type === t ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}>
                                    <input type="radio" name="type" value={t} checked={form.type === t} onChange={handleChange} className="sr-only" />
                                    <div className="text-2xl mb-1">{t === 'feedback' ? '💬' : '⚠️'}</div>
                                    <div className="font-semibold capitalize text-gray-900 dark:text-white text-sm">{t}</div>
                                </label>
                            ))}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                            <select name="category" value={form.category} onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary">
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department <span className="text-gray-400">(optional)</span></label>
                            <input type="text" name="department" value={form.department} onChange={handleChange}
                                placeholder="e.g. Computer Engineering"
                                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message <span className="text-red-500">*</span></label>
                            <textarea name="message" value={form.message} onChange={handleChange} rows={5} maxLength={2000}
                                placeholder="Describe your feedback or grievance in detail..."
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                            <p className="text-xs text-gray-400 text-right">{form.message.length}/2000</p>
                        </div>

                        {/* Anonymous toggle */}
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                            <input type="checkbox" name="isAnonymous" checked={form.isAnonymous} onChange={handleChange}
                                className="w-4 h-4 accent-primary rounded" id="anonymous-toggle" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Submit anonymously (your identity will not be shared)</span>
                        </label>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <button type="submit" disabled={submitting}
                            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-700 active:scale-[.99] transition disabled:opacity-60"
                            id="feedback-submit-btn">
                            {submitting ? 'Submitting...' : `Submit ${form.type === 'grievance' ? 'Grievance' : 'Feedback'}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Feedback;
