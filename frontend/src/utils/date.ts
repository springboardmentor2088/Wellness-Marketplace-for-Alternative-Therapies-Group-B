/**
 * Standardizes date formatting to Indian format (DD/MM/YYYY)
 * @param date string or Date object
 * @returns formatted date string
 */
export const formatDateToIndian = (date: string | Date | undefined | null): string => {
    if (!date) return 'N/A';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return 'Invalid Date';

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(d);
};
