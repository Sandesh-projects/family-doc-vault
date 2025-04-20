// frontend/src/components/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom"; // Import Navigate for redirection
// import { useAuth } from "../context/AuthContext"; // Import the useAuth hook
import { useAuth } from "../context/AuthContext"; // Correct path

// PrivateRoute component to protect routes
// It checks authentication status and renders children if authenticated,
// otherwise redirects to the login page.
function PrivateRoute({ children }) {
  // Use the useAuth hook to access the authentication state from context
  const { isAuthenticated, loading } = useAuth(); // Assuming your useAuth hook provides isAuthenticated and loading state

  // While authentication status is being loaded, you might render a loading indicator
  // if your auth context setup involves asynchronous checks (like checking localStorage)
  if (loading) {
    // Optional: Render a spinner or loading message
    // You'll need to create a LoadingSpinner component or similar
    // return <div>Loading...</div>;
    // For now, we'll just render null or children directly if loading is handled elsewhere
    return null; // Or a loading component
  }

  // Check if the user is authenticated
  if (isAuthenticated) {
    // If authenticated, render the child routes/components
    return children;
  } else {
    // If not authenticated, redirect to the login page
    // 'replace' prop prevents adding the protected route to the history stack
    return <Navigate to="/login" replace />;
  }
}

export default PrivateRoute;
