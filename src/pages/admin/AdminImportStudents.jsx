// ============================================
// pages/admin/AdminImportStudents.jsx — CSV Bulk Import
// ============================================

import { useState, useRef } from 'react';
import api from '../../utils/axios';

const SAMPLE_CSV = `name,email,enrollmentNo,semester,department
Aryan Shah,aryan.shah@vgec.ac.in,220010107001,3,Computer Engineering
Priya Patel,priya.patel@vgec.ac.in,220010107002,3,Computer Engineering`;

const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'students_template.csv'; a.click();
    URL.revokeObjectURL(url);
};

const AdminImportStudents = () => {
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const fileRef = useRef();

    const handleFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!f.name.endsWith('.csv')) { setError('Only .csv files are accepted.'); setFile(null); return; }
        setError('');
        setFile(f);
        setResult(null);
    };

    const handleImport = async () => {
        if (!file) { setError('Please select a CSV file first.'); return; }
        setImporting(true);
        setError('');
        const formData = new FormData();
        formData.append('csv', file);
        try {
            const { data } = await api.post('/admin/import-students', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(data);
            setFile(null);
            if (fileRef.current) fileRef.current.value = '';
        } catch (err) {
            setError(err?.response?.data?.message || 'Import failed. Please try again.');
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Import Students</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">Upload a CSV file to add multiple students at once.</p>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 text-sm text-blue-800 dark:text-blue-300">
                <p className="font-semibold mb-1">📋 Required CSV columns:</p>
                <code className="block bg-white/60 dark:bg-black/20 px-2 py-1 rounded text-xs font-mono">
                    name, email, enrollmentNo, semester, department
                </code>
                <p className="mt-2 text-xs">Default password for each student will be: <code>Vgec@{'{enrollmentNo}'}</code></p>
                <button onClick={downloadSample} className="mt-2 text-blue-600 dark:text-blue-400 font-medium hover:underline text-xs">
                    ⬇ Download Sample Template
                </button>
            </div>

            {/* Upload area */}
            <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-10 text-center mb-4 cursor-pointer hover:border-primary transition"
                onClick={() => fileRef.current?.click()}
                id="csv-upload-zone"
            >
                <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" id="csv-file-input" />
                <div className="text-4xl mb-3">📄</div>
                {file ? (
                    <p className="font-semibold text-primary">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
                ) : (
                    <>
                        <p className="font-semibold text-gray-700 dark:text-gray-300">Click to choose CSV file</p>
                        <p className="text-sm text-gray-400 mt-1">or drag and drop here</p>
                    </>
                )}
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
                onClick={handleImport}
                disabled={!file || importing}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-60"
                id="import-btn"
            >
                {importing ? 'Importing...' : 'Import Students'}
            </button>

            {/* Results */}
            {result && (
                <div className="mt-8 space-y-4">
                    <div className={`rounded-xl p-5 ${result.errors?.length === 0 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200'}`}>
                        <p className="font-semibold text-gray-900 dark:text-white">{result.message}</p>
                    </div>

                    {result.created?.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">✅ Successfully Created ({result.created.length})</h3>
                            <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden max-h-48 overflow-y-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                                        <tr>
                                            <th className="px-3 py-2 text-left">Name</th>
                                            <th className="px-3 py-2 text-left">Email</th>
                                            <th className="px-3 py-2 text-left">Enrollment No</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {result.created.map((s, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2 text-gray-900 dark:text-white">{s.name}</td>
                                                <td className="px-3 py-2 text-gray-500">{s.email}</td>
                                                <td className="px-3 py-2 text-gray-500">{s.enrollmentNo}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {result.errors?.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">❌ Failed ({result.errors.length})</h3>
                            <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden max-h-48 overflow-y-auto">
                                {result.errors.map((e, i) => (
                                    <div key={i} className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 text-xs">
                                        <span className="text-gray-900 dark:text-white font-medium">{e.row?.email || e.row?.enrollmentNo || `Row ${i + 1}`}</span>
                                        <span className="text-red-500 ml-2">{e.reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminImportStudents;
