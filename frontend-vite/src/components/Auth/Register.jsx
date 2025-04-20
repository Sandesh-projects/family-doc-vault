// frontend/src/components/Auth/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate
import { Form, Button, Card, Alert, Container } from "react-bootstrap"; // Import Bootstrap components
import { useAuth } from "../../context/AuthContext"; // Import the useAuth hook

// Register component with a user-friendly form
function Register() {
  // State for form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState(""); // State for Aadhaar

  // State for loading and error feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use the useAuth hook for the register function
  const { register } = useAuth();

  // Use useNavigate for redirection after successful registration
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission

    // --- Client-side Validation ---
    if (!name || !email || !password || !confirmPassword) {
      return setError("Please fill in all required fields");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    // Basic Aadhaar number format validation if provided
    if (aadhaarNumber && !/^\d{12}$/.test(aadhaarNumber)) {
      return setError("Please enter a valid 12-digit Aadhaar number");
    }
    // --- End Validation ---

    setError(""); // Clear previous errors
    setLoading(true); // Set loading state

    try {
      // Prepare user data object for the API call
      const userData = {
        name,
        email,
        password,
        // Only include aadhaarNumber if it was entered
        ...(aadhaarNumber && { aadhaarNumber }), // Spread operator adds aadhaarNumber if it's not empty
      };

      const res = await register(userData); // Call register function from AuthContext

      if (res && res.success) {
        // Registration successful, redirect to the login page
        // Consider showing a success message before redirecting
        console.log("Registration successful, redirecting to login.");
        navigate("/login"); // Redirect to login page
      } else {
        // Handle API specific failure messages from authService if success: false is returned
        setError(res?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      // Handle errors thrown by authService (e.g., network errors, backend validation errors)
      setError(
        err.message || "An unexpected error occurred during registration."
      );
    } finally {
      setLoading(false); // Clear loading state
    }
  };

  return (
    <Container className="d-flex justify-content-center">
      {" "}
      {/* Center the card */}
      <Card style={{ width: "100%", maxWidth: "450px" }}>
        {" "}
        {/* Card for the form, slightly wider than login */}
        <Card.Body>
          <h2 className="text-center mb-4">Sign Up</h2> {/* Centered heading */}
          {/* Display error alert if error state is not empty */}
          {error && <Alert variant="danger">{error}</Alert>}
          {/* Registration Form */}
          <Form onSubmit={handleSubmit}>
            {/* Name Field */}
            <Form.Group className="mb-3" controlId="formName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required // HTML5 required attribute
              />
            </Form.Group>

            {/* Email Field */}
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required // HTML5 required attribute
              />
            </Form.Group>

            {/* Password Field */}
            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required // HTML5 required attribute
              />
            </Form.Group>

            {/* Confirm Password Field */}
            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required // HTML5 required attribute
              />
            </Form.Group>

            {/* Aadhaar Number Field (Optional) */}
            <Form.Group className="mb-3" controlId="formAadhaar">
              <Form.Label>Aadhaar Number (Optional)</Form.Label>
              <Form.Control
                type="text" // Use text to allow leading zeros if necessary, validate format
                placeholder="Enter 12-digit Aadhaar number"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                // Not required attribute as it's optional
                maxLength={12} // Limit input length
              />
            </Form.Group>

            {/* Submit Button */}
            <Button
              variant="success" // Use success variant for registration
              type="submit"
              className="w-100" // Full width button
              disabled={loading} // Disable while loading
            >
              {loading ? "Signing Up..." : "Sign Up"}{" "}
              {/* Change text while loading */}
            </Button>
          </Form>
          {/* Link to Login Page */}
          <div className="w-100 text-center mt-3">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Register;
