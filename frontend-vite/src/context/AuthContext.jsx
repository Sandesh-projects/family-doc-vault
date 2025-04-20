// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import authService from "../services/authService"; // Import your auth service
import { jwtDecode } from "jwt-decode"; // Correct import for jwt-decode v4+

// Create the Auth Context
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true, // Add a loading state
  login: async () => {}, // Placeholder async functions
  register: async () => {},
  logout: () => {},
});

// Auth Context Provider Component
export const AuthContextProvider = ({ children }) => {
  // State to hold authentication status and user data
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Initially loading while checking localStorage

  // useEffect to check for token in localStorage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      try {
        // Decode the token to check its validity and expiry
        const decodedUser = jwtDecode(storedToken);

        // Check if the token is expired
        // decodedUser.exp is in seconds, Date.now() is in milliseconds
        if (decodedUser.exp * 1000 < Date.now()) {
          // Token is expired, clear it from storage
          localStorage.removeItem("token");
          localStorage.removeItem("user"); // Clear stored user data as well
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
          console.log("Token expired. User logged out."); // Use console.log for context internal logs
        } else {
          // Token is valid, set auth state
          // We might store the user details directly in localStorage during login/register
          // or fetch them here using the token
          const storedUser = JSON.parse(localStorage.getItem("user"));
          setIsAuthenticated(true);
          setToken(storedToken);
          setUser(storedUser); // Assuming user data is stored alongside token
        }
      } catch (error) {
        // Error decoding token (e.g., malformed token)
        console.error("Error decoding token from localStorage:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    }
    // Set loading to false once the check is complete
    setLoading(false);
  }, []); // Empty dependency array means this runs only once on mount

  // Login Function
  const login = async (email, password) => {
    setLoading(true); // Set loading during the API call
    try {
      const res = await authService.login(email, password); // Call backend service

      if (res.success) {
        // Store token and user data in localStorage
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user)); // Assuming backend returns user details

        // Update state
        setIsAuthenticated(true);
        setToken(res.token);
        setUser(res.user);
        setLoading(false);
        console.log("Login successful!");
        return { success: true }; // Indicate success
      } else {
        // Handle login failure (e.g., invalid credentials handled by authService and backend error handler)
        setLoading(false);
        // The authService should throw an error caught by the catch block,
        // or return success: false with an error message.
        // If it returns success: false, handle the message here.
        console.error("Login failed:", res.message || "Unknown error");
        return { success: false, message: res.message || "Login failed" }; // Indicate failure
      }
    } catch (error) {
      // Handle API call errors (network issues, server errors)
      setLoading(false);
      console.error("Login API error:", error);
      // Pass the error message back to the component that called login
      throw error; // Re-throw the error so components can catch it
    }
  };

  // Register Function
  const register = async (userData) => {
    setLoading(true); // Set loading during the API call
    try {
      const res = await authService.register(userData); // Call backend service

      if (res.success) {
        // Registration successful. Decide whether to auto-login or just redirect to login page.
        // For simplicity, let's just indicate success. Auto-login logic could go here.
        setLoading(false);
        console.log("Registration successful!");
        // You might want to call login(userData.email, userData.password) here if auto-logging in
        return { success: true }; // Indicate success
      } else {
        setLoading(false);
        console.error("Registration failed:", res.message || "Unknown error");
        return {
          success: false,
          message: res.message || "Registration failed",
        }; // Indicate failure
      }
    } catch (error) {
      setLoading(false);
      console.error("Registration API error:", error);
      throw error; // Re-throw the error
    }
  };

  // Logout Function
  const logout = () => {
    // Clear token and user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Reset state
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    console.log("User logged out.");
    // You might redirect the user to the login page here using react-router-dom's navigate
    // Example: navigate('/login'); - requires getting navigate from useNavigation or similar
  };

  // Context value to be provided to consuming components
  const contextValue = {
    isAuthenticated,
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  // Provide the context value to children
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to easily consume the Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // This check ensures useAuth is called inside a component wrapped by AuthContextProvider
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
