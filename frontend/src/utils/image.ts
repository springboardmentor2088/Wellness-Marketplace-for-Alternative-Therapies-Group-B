import { API_BASE_URL } from '../config';

/**
 * Formats a raw image path from the backend into a full URL.
 * Handles absolute URLs, relative 'uploads/' paths, and fallbacks.
 */
export const formatImageUrl = (path?: string): string | undefined => {
    if (!path) return undefined;

    // If it's already a full URL, return it
    if (path.startsWith('http')) {
        return path;
    }

    // If it starts with 'uploads/', prefix it with the base URL
    if (path.startsWith('uploads/')) {
        return `${API_BASE_URL}/${path}`;
    }

    // If it's a relative path without 'uploads/', assume it needs the base URL too
    // Some paths might be just 'products/xxx.jpg' depending on how they are stored
    return `${API_BASE_URL}/${path}`;
};
