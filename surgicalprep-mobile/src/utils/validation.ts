/**
 * Form Validation Utilities
 *
 * Validation functions for form inputs.
 * Each function returns an error message string if validation fails,
 * or undefined if validation passes.
 */

/**
 * Validate email format
 */
export const validateEmail = (email: string): string | undefined => {
  if (!email || email.trim().length === 0) {
    return 'Email is required';
  }

  const trimmed = email.trim().toLowerCase();

  // Simple email regex - covers most valid cases
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid email address';
  }

  // Check for reasonable length
  if (trimmed.length > 254) {
    return 'Email address is too long';
  }

  return undefined;
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (password.length > 128) {
    return 'Password is too long';
  }

  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return 'Password must contain at least one letter and one number';
  }

  // Check for common weak passwords
  const weakPasswords = [
    'password123',
    '12345678',
    'qwerty123',
    'abc12345',
    'password1',
  ];
  if (weakPasswords.includes(password.toLowerCase())) {
    return 'This password is too common. Please choose a stronger one';
  }

  return undefined;
};

/**
 * Validate name (full name)
 */
export const validateName = (name: string): string | undefined => {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return 'Name must be at least 2 characters';
  }

  if (trimmed.length > 100) {
    return 'Name is too long';
  }

  // Check for reasonable characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  if (!nameRegex.test(trimmed)) {
    return 'Name contains invalid characters';
  }

  return undefined;
};

/**
 * Validate required field (generic)
 */
export const validateRequired = (
  value: string | null | undefined,
  fieldName: string = 'This field'
): string | undefined => {
  if (value === null || value === undefined || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return undefined;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string = 'This field'
): string | undefined => {
  if (value.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return undefined;
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string = 'This field'
): string | undefined => {
  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }
  return undefined;
};

/**
 * Combine multiple validators
 * Returns the first error message, or undefined if all pass
 */
export const validateAll = (
  ...validators: (string | undefined)[]
): string | undefined => {
  for (const error of validators) {
    if (error) return error;
  }
  return undefined;
};

/**
 * Validate passwords match
 */
export const validatePasswordsMatch = (
  password: string,
  confirmPassword: string
): string | undefined => {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return undefined;
};
