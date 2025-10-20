// format number to philippine peso currency
// param {number} amount - the amount to format
// returns {string} formatted currency string

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
};

// format price without currency symbol
// param {number} amount - the amount to format
// returns {string} formatted price string

export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};