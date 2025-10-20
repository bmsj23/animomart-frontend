// validate email address
// param {string} email - email to validate
// returns {boolean} true if valid

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// validate dlsl email address
// param {string} email - email to validate
// returns {boolean} true if valid dlsl email

export const validateDLSLEmail = (email) => {
  return email.endsWith("@dlsl.edu.ph");
};


// validate password strength
// param {string} password - password to validate
// returns {object} validation result with isValid and message

export const validatePassword = (password) => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  return { isValid: true, message: "Password is strong" };
};


// validate phone number (philippine format)
// param {string} phone - phone number to validate
// returns {boolean} true if valid

export const validatePhone = (phone) => {
  // accepts formats: 09171234567, +639171234567, 9171234567
  const phoneRegex = /^(\+63|0)?9\d{9}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ""));
};

// validate price
// param {number} price - price to validate
// returns {boolean} true if valid

export const validatePrice = (price) => {
  return !isNaN(price) && price > 0;
};

// validate stock
// param {number} stock - stock to validate
// returns {boolean} true if valid

export const validateStock = (stock) => {
  return !isNaN(stock) && stock >= 0 && Number.isInteger(Number(stock));
};

// validate required field
// param {any} value - value to validate
// returns {boolean} true if not empty

export const validateRequired = (value) => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

// validate min length
// param {string} value - value to validate
// param {number} minLength - minimum length
// returns {boolean} true if valid

export const validateMinLength = (value, minLength) => {
  return value.length >= minLength;
};

// validate max length
// param {string} value - value to validate
// param {number} maxLength - maximum length
// returns {boolean} true if valid

export const validateMaxLength = (value, maxLength) => {
  return value.length <= maxLength;
};