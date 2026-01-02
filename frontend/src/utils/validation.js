import { VALIDATION } from "./constants";

export const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!VALIDATION.EMAIL_REGEX.test(email)) return "Please enter a valid email address";
  return null;
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters long`;
  }
  return null;
};

export const validateName = (name) => {
  if (!name) return "Name is required";
  if (name.trim().length < 2) return "Name must be at least 2 characters long";
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return null;
};

export const validateLoginForm = (formData) => {
  const errors = {};
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSignupForm = (formData) => {
  const errors = {};
  
  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;
  
  const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};