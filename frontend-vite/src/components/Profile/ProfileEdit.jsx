// frontend/src/components/Profile/ProfileEdit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Use useNavigate for redirect
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap"; // Import Bootstrap components
// import { useAuth } from '../../context/AuthContext'; // Not strictly needed here as we use userService
import userService from "../../services/userService"; // Import user service

// ProfileEdit component for updating user profile details
function ProfileEdit() {
  // State for form inputs, initialized to empty strings
  const [name, setName] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");

  // State for loading initial data and saving updates
  const [loading, setLoading] = useState(true); // Loading initial data
  const [saving, setSaving] = useState(false); // Saving updates

  // State for feedback messages
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Use useNavigate for redirection
  const navigate = useNavigate();

  // Effect to fetch the user's current profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true); // Start loading initial data
      setError(""); // Clear any previous errors
      try {
        const response = await userService.getMe(); // Fetch current user data
        if (response && response.success && response.data) {
          // Populate form state with fetched data
          setName(response.data.name || ""); // Use empty string if data is null/undefined
          setAadhaarNumber(response.data.aadhaarNumber || "");
        } else {
          setError(
            response?.message || "Failed to load profile data for editing."
          );
        }
      } catch (err) {
        setError(
          err.message ||
            "An unexpected error occurred while loading profile data."
        );
      } finally {
        setLoading(false); // Stop loading initial data
      }
    };

    fetchUserProfile(); // Call the fetch function
  }, []); // Empty dependency array means this runs only once on mount

  // Handle form submission for updating profile
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // --- Client-side Validation (Optional but Recommended) ---
    if (!name) {
      return setError("Name is required.");
    }
    if (aadhaarNumber && !/^\d{12}$/.test(aadhaarNumber)) {
      return setError("Please enter a valid 12-digit Aadhaar number.");
    }
    // --- End Validation ---

    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages
    setSaving(true); // Set saving state

    try {
      // Prepare data for update (only include fields that are allowed to be updated)
      const updateData = { name, aadhaarNumber };

      const response = await userService.updateMe(updateData); // Call the updateMe service

      if (response && response.success) {
        setSuccessMessage("Profile updated successfully!"); // Show success message
        // Optionally, you might want to refresh the user data in AuthContext here
        // Or navigate back to the profile view after a short delay
        setTimeout(() => {
          navigate("/profile"); // Redirect to profile view after 2 seconds
        }, 2000);
      } else {
        setError(response?.message || "Failed to update profile.");
      }
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred during profile update."
      );
    } finally {
      setSaving(false); // Clear saving state
    }
  };

  // If loading initial data, show a spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Profile Data...</span>
        </Spinner>
      </div>
    );
  }

  // If there's an error after loading, show an alert
  if (error && !saving) {
    // Only show error if not actively saving
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  // Render the edit profile form
  return (
    <Card>
      {" "}
      {/* Bootstrap Card for the form */}
      <Card.Body>
        <Card.Title className="text-center mb-4">Edit Profile</Card.Title>{" "}
        {/* Centered Title */}
        {/* Display success or error alerts */}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}{" "}
        {/* Show error while saving too */}
        {/* Edit Profile Form */}
        <Form onSubmit={handleSubmit}>
          {/* Name Field */}
          <Form.Group className="mb-3" controlId="editFormName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required // HTML5 required attribute
              disabled={saving} // Disable inputs while saving
            />
          </Form.Group>

          {/* Aadhaar Number Field */}
          <Form.Group className="mb-3" controlId="editFormAadhaar">
            <Form.Label>Aadhaar Number (Optional)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter 12-digit Aadhaar number"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value)}
              disabled={saving} // Disable inputs while saving
              maxLength={12} // Limit input length
            />
          </Form.Group>

          {/* Email and Password are typically not edited on this page */}
          {/* You would add separate flows for changing email or password */}
          <p className="text-muted mt-4">
            To change email or password, please use the respective options.
          </p>

          {/* Submit Button */}
          <Button
            variant="primary"
            type="submit"
            className="w-100" // Full width button
            disabled={saving} // Disable button while saving
          >
            {saving ? "Saving..." : "Save Changes"}{" "}
            {/* Change button text while saving */}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default ProfileEdit;
