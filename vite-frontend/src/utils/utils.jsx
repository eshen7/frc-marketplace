export function haversine(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius of Earth in miles

    // Convert latitude and longitude from degrees to radians
    const toRadians = (degree) => (degree * Math.PI) / 180;
    lat1 = toRadians(lat1);
    lon1 = toRadians(lon1);
    lat2 = toRadians(lat2);
    lon2 = toRadians(lon2);

    // Differences in latitude and longitude
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;

    // Haversine formula
    const a = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in miles
}

export function getDaysUntil(dueDate) {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export function isDate(value) {
    return Object.prototype.toString.call(value) === '[object Date]';
}
