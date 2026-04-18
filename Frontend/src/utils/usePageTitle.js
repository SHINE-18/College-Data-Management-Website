import { useEffect } from 'react';

/**
 * usePageTitle — Sets the browser tab title for the current page.
 * @param {string} title - Page-specific title (e.g., "Faculty Directory")
 * @param {string} [suffix] - Optional suffix (defaults to "VGEC")
 */
const usePageTitle = (title, suffix = 'VGEC') => {
    useEffect(() => {
        const prevTitle = document.title;
        document.title = title ? `${title} | ${suffix}` : 'Vishwakarma Government Engineering College';
        return () => { document.title = prevTitle; };
    }, [title, suffix]);
};

export default usePageTitle;
