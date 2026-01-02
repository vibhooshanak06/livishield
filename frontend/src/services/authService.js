import { AUTH_ENDPOINTS } from "../utils/constants";

export const loginUser = async (data) => {
  try {
    const res = await fetch(AUTH_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // important (cookies)
      body: JSON.stringify(data),
    });

    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.message || "Login failed");
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
      credentials: "include",
      body: JSON.stringify(data),
    });

    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.message || "Signup failed");
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
    const res = await fetch(AUTH_ENDPOINTS.LOGOUT, {
      method: "POST",
      credentials: "include",
    });

    const result = await res.json();
    
    if (!res.ok) {
      throw new Error(result.message || "Logout failed");
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Network error occurred",
    };
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await fetch(AUTH_ENDPOINTS.ME, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Not authenticated");
    }

    return await res.json();
  } catch (error) {
    throw error;
  }
};
