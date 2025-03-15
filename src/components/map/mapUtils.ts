// Debounce helper function
export const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Calculate zoom level based on radius
export const calculateZoomLevel = (radiusInKm: number): number => {
    if (radiusInKm <= 1) return 15;
    if (radiusInKm <= 2) return 14;
    if (radiusInKm <= 5) return 13;
    if (radiusInKm <= 10) return 12;
    if (radiusInKm <= 20) return 11;
    if (radiusInKm <= 50) return 10;
    if (radiusInKm <= 100) return 9;
    return 8;
};