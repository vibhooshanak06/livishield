import { AUTH_ENDPOINTS, STORAGE_KEYS } from "../utils/constants";

export const loginUser = async (data) => {
  try {
    const res = await fetch(AUTH_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.message || "Login failed");
    }

    // Get token from response header
    const authHeader = res.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data.user));
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Network error occurred",
    };
  }
};

export const signupUser = async (data) => {
  try {
    const res = await fetch(AUTH_ENDPOINTS.SIGNUP, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.message || "Signup failed");
    }

    // Get token from response header
    const authHeader = res.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data.user));
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Network error occurred",
    };
  }
};

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    const res = await fetch(AUTH_ENDPOINTS.LOGOUT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();
    
    // Clear local storage regardless of response
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    if (!res.ok) {
      throw new Error(result.message || "Logout failed");
    }
    
    return result;
  } catch (error) {
    // Clear local storage even if request fails
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    
    return {
      success: false,
      message: error.message || "Network error occurred",
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (!token) {
      throw new Error("No token found");
    }

    const res = await fetch(AUTH_ENDPOINTS.ME, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("Not authenticated");
    }

    const result = await res.json();
    
    if (result.success) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data));
      return result;
    }
    
    throw new Error(result.message || "Failed to get user");
  } catch (error) {
    // Clear invalid token
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    throw error;
  }
};

// Helper function to get stored token
export const getStoredToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

// Helper function to get stored user
export const getStoredUser = () => {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : null;
};
