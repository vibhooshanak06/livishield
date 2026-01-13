import { createContext, useContext, useState, useEffect } from "react";
import { logoutUser, getCurrentUser, getStoredToken, getStoredUser } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getStoredToken();
        const storedUser = getStoredUser();
        
        if (token && storedUser) {
          // First set the user from localStorage to avoid flash
          setUser(storedUser);
          setIsAuthenticated(true);
          
          // Then verify token with backend
          try {
            const response = await getCurrentUser();
            if (response.success) {
              // Update user data from server
              setUser(response.data);
              setIsAuthenticated(true);
            } else {
              // Token is invalid, clear everything
              localStorage.removeItem('liveshield_token');
              localStorage.removeItem('liveshield_user');
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            // Token might be expired, clear storage
            localStorage.removeItem('liveshield_token');
            localStorage.removeItem('liveshield_user');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          // No token or user data found
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
