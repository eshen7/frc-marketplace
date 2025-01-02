import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from "../utils/axiosInstance";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
    };

    checkAuthStatus(); // Check on mount

    // Set up an event listener for storage changes
    window.addEventListener("storage", checkAuthStatus);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated) {
        setLoadingUser(false);
        return;
      }

      try {
        const response = await axiosInstance.get("/users/self/");
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, [isAuthenticated]);

  return (
    <UserContext.Provider value={{
      user, setUser,
      loadingUser, setLoadingUser,
      isAuthenticated, setIsAuthenticated
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 