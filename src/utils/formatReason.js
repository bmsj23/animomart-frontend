// converts snake_case reason strings to Title Case
export const formatReason = (reason) => {
  if (!reason) return '';

  return reason
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};