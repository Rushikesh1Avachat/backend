// ==========================================
// Validation Rules & Helper Functions
// ==========================================

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateName = (name) => {
  return name && name.length >= 2 && name.length <= 60;
};

export const validateAddress = (address) => {
  return address && address.length <= 400;
};

export const validatePassword = (password) => {
  // Password must be 8-16 chars with uppercase and special character
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/;
  return passwordRegex.test(password);
};

export const validateRating = (rating) => {
  const num = Number(rating);
  return num >= 1 && num <= 5;
};

export const validateRegistration = (data) => {
  const { name, email, password, address, role } = data;

  if (!validateName(name)) {
    return { valid: false, error: 'Name must be 2-60 characters' };
  }

  if (!validateEmail(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!validatePassword(password)) {
    return {
      valid: false,
      error: 'Password must be 8-16 chars with uppercase and special character',
    };
  }

  if (!validateAddress(address)) {
    return { valid: false, error: 'Address must be less than 400 characters' };
  }

  if (!['user', 'owner', 'admin'].includes(role)) {
    return { valid: false, error: 'Invalid role' };
  }

  return { valid: true };
};

export const validateLogin = (data) => {
  const { email, password } = data;

  if (!validateEmail(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!password || password.length < 8) {
    return { valid: false, error: 'Invalid password' };
  }

  return { valid: true };
};

export const validateStore = (data) => {
  const { name, address, ownerEmail } = data;

  if (!validateName(name)) {
    return { valid: false, error: 'Store name must be 2-60 characters' };
  }

  if (!validateAddress(address)) {
    return { valid: false, error: 'Address must be less than 400 characters' };
  }

  if (ownerEmail && !validateEmail(ownerEmail)) {
    return { valid: false, error: 'Valid owner email is required' };
  }

  return { valid: true };
};

export const validateUser = (data) => {
  const { name, email, password, address, role } = data;

  if (name && !validateName(name)) {
    return { valid: false, error: 'Name must be 2-60 characters' };
  }

  if (email && !validateEmail(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (password && !validatePassword(password)) {
    return {
      valid: false,
      error: 'Password must be 8-16 chars with uppercase and special character',
    };
  }

  if (address && !validateAddress(address)) {
    return { valid: false, error: 'Address must be less than 400 characters' };
  }

  if (role && !['user', 'owner', 'admin'].includes(role)) {
    return { valid: false, error: 'Invalid role' };
  }

  return { valid: true };
};
