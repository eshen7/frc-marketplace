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
    dueDate = new Date(dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

export function isDate(value) {
    return Object.prototype.toString.call(value) === '[object Date]';
}

export function formatTimestamp(isoTimestamp) {
    const date = new Date(isoTimestamp);
    return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric',
    });
}

export function timeSince(timestamp) {
    // Convert string timestamps to Date if needed
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
  
    // Less than 60 seconds => use seconds
    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds === 1 ? "" : "s"}`;
    }
  
    // Less than 60 minutes => use minutes
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"}`;
    }
  
    // Less than 24 hours => use hours
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"}`;
    }
  
    // Otherwise => use days
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"}`;
  }