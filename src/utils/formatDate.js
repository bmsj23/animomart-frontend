// format date to readable string
// param {string|Date} date - the date to format
// param {string} format - format type ('short', 'long', 'relative')
// returns {string} formatted date string

export const formatDate = (date, format = "short") => {
    const dateObj = new Date(date);

  if (format === "relative") {
    return getRelativeTime(dateObj);
  }

  const options =
    format === "long"
      ? {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : { year: "numeric", month: "short", day: "numeric" };

  return dateObj.toLocaleDateString("en-US", options);
};

// get relative time (e.g., "2 hours ago", "just now")
// param {Date} date - the date to compare
// returns {string} relative time string

export const getRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

// format time only
// param {string|Date} date - the date to format
// returns {string} formatted time string

export const formatTime = (date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};