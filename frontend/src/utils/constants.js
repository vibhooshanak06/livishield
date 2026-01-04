// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  SIGNUP: `${API_BASE_URL}/auth/register`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  ME: `${API_BASE_URL}/auth/me`,
};

// App routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
};

// Local storage keys
export const STORAGE_KEYS = {
  USER: "liveshield_user",
  TOKEN: "liveshield_token",
};

// Form validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};