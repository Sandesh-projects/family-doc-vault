// frontend-vite/src/routes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // Removed BrowserRouter import
import PrivateRoute from "./components/PrivateRoute.jsx"; // Import the PrivateRoute component

// Import your page components
import Login from "./components/Auth/Login.jsx";
import Register from "./components/Auth/Register.jsx";
import DocumentList from "./components/Documents/DocumentList.jsx";
import DocumentUpload from "./components/Documents/DocumentUpload.jsx";
import DocumentDetails from "./components/Documents/DocumentDetails.jsx";
import DocumentEdit from "./components/Documents/DocumentEdit.jsx";
import DocumentShare from "./components/Documents/DocumentShare.jsx";
import ProfileView from "./components/Profile/ProfileView.jsx";
import ProfileEdit from "./components/Profile/ProfileEdit.jsx";
import FamilyMembers from "./components/Profile/FamilyMembers.jsx";

// AppRoutes component defines all the routes for the application
function AppRoutes() {
  return (
    // The Router is now in main.jsx, so we just need Routes here
    <Routes>
      {" "}
      {/* The Routes component acts like a switch, rendering the first match */}
      {/* --- Public Routes --- */}
      {/* These routes are accessible without authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Redirect root path to documents (PrivateRoute will handle redirect to login if not auth) */}
      <Route path="/" element={<Navigate to="/documents" replace />} />
      {/* --- Protected Routes --- */}
      {/* Wrap components that require authentication with the PrivateRoute component */}
      {/* Document Routes */}
      <Route
        path="/documents"
        element={
          <PrivateRoute>
            <DocumentList />
          </PrivateRoute>
        }
      />
      <Route
        path="/documents/upload"
        element={
          <PrivateRoute>
            <DocumentUpload />
          </PrivateRoute>
        }
      />
      <Route
        path="/documents/:id"
        element={
          <PrivateRoute>
            <DocumentDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/documents/:id/edit"
        element={
          <PrivateRoute>
            <DocumentEdit />
          </PrivateRoute>
        }
      />
      <Route
        path="/documents/:id/share"
        element={
          <PrivateRoute>
            <DocumentShare />
          </PrivateRoute>
        }
      />
      {/* Profile Routes */}
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfileView />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <PrivateRoute>
            <ProfileEdit />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/family"
        element={
          <PrivateRoute>
            <FamilyMembers />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/:id"
        element={
          <PrivateRoute>
            <ProfileView />
          </PrivateRoute>
        }
      />
      {/* --- 404 Not Found Route (Optional) --- */}
      {/* If none of the above paths match, you could render a 404 component */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default AppRoutes;
