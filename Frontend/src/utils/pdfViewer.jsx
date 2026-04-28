// ============================================
// utils/pdfViewer.jsx — Shared PDF preview utilities
// ============================================
// Cloudinary 'raw' uploads serve PDFs with Content-Disposition: attachment by default,
// which forces a browser download. Google Docs Viewer fetches the PDF server-side and
// renders it inline in an iframe, bypassing this restriction for older uploaded files.
// New uploads use flags: 'inline' so they can be previewed directly too.

import { useState } from 'react';

/**
 * Converts any PDF URL to a Google Docs Viewer embedded URL.
 * Works for both Cloudinary 'raw' URLs and regular PDF links.
 */
export const googleDocsViewerUrl = (url) =>
    `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

/**
 * Full-screen PDF preview modal.
 * Usage:
 *   const { previewUrl, openPreview, closePreview, PdfModal } = usePdfPreview();
 *   <PdfModal />
 *   <button onClick={() => openPreview(url, 'My PDF Title')}>View</button>
 */
export const usePdfPreview = () => {
    const [state, setState] = useState({ url: null, title: '' });
    const [iframeKey, setIframeKey] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const openPreview = (url, title = 'PDF Preview') => {
        setState({ url, title });
        setIframeKey(k => k + 1);
        setLoaded(false);
    };

    const closePreview = () => setState({ url: null, title: '' });

    const PdfModal = () => {
        if (!state.url) return null;
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                onClick={closePreview}
            >
                <div
                    className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-4xl flex flex-col"
                    style={{ maxHeight: '92vh' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Modal header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2 truncate">
                            <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5z" />
                            </svg>
                            <span className="truncate">{state.title}</span>
                        </p>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                            <button
                                onClick={() => { setLoaded(false); setIframeKey(k => k + 1); }}
                                title="Reload"
                                className="text-xs text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reload
                            </button>
                            <a
                                href={state.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Open
                            </a>
                            <a
                                href={state.url}
                                download
                                className="text-xs text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition font-medium flex items-center gap-1"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                            </a>
                            <button
                                onClick={closePreview}
                                className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition font-medium"
                            >
                                Close ✕
                            </button>
                        </div>
                    </div>

                    {/* PDF iframe */}
                    <div className="relative flex-1" style={{ minHeight: '70vh' }}>
                        {!loaded && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3" />
                                <p className="text-sm text-gray-400">Loading PDF…</p>
                                <p className="text-xs text-gray-300 mt-1">If blank, click <strong>Reload</strong> above</p>
                            </div>
                        )}
                        <iframe
                            key={iframeKey}
                            src={googleDocsViewerUrl(state.url)}
                            title={state.title}
                            className="w-full h-full border-0"
                            style={{ minHeight: '70vh' }}
                            onLoad={() => setLoaded(true)}
                            allow="fullscreen"
                        />
                    </div>
                </div>
            </div>
        );
    };

    return { previewUrl: state.url, openPreview, closePreview, PdfModal };
};
