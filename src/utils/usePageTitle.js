import { useEffect } from 'react';

/**
 * usePageTitle — Sets the browser tab title for the current page.
 * @param {string} title - Page-specific title (e.g., "Faculty Directory")
 * @param {string} [suffix] - Optional suffix (defaults to "VGEC CE Department")
 */
const usePageTitle = (title, suffix = 'VGEC CE Department') => {
    useEffect(() => {
        const prevTitle = document.title;
        document.title = title ? `${title} | ${suffix}` : suffix;
        return () => { document.title = prevTitle; };
    }, [title, suffix]);
};

export default usePageTitle;
