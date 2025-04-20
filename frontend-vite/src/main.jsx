// frontend-vite/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client"; // Use createRoot for React 18+
import App from "./App.jsx"; // Import the main App component
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { AuthContextProvider } from "./context/AuthContext.jsx"; // Import Auth Context Provider
// import "./index.css"; // Optional: Import a basic index.css for global styles
import { BrowserRouter as Router } from "react-router-dom"; // Import BrowserRouter

// Get the root element from index.html (usually in the project root's public folder)
const container = document.getElementById("root");

// Create a root for rendering with the new React 18 API
const root = ReactDOM.createRoot(container);

// Render the main App component into the root
root.render(
  <React.StrictMode>
    {/* Wrap the entire app with AuthContextProvider to provide auth state */}
    <AuthContextProvider>
      {/* Wrap the App component with the Router */}
      <Router>
        {" "}
        {/* Moved Router here */}
        <App /> {/* App component will handle layout and render routes */}
      </Router>
    </AuthContextProvider>
  </React.StrictMode>
);
