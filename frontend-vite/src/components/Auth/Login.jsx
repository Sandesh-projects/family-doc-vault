// frontend/src/components/Auth/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate
import { Form, Button, Card, Alert, Container } from "react-bootstrap"; // Import Bootstrap components
import { useAuth } from "../../context/AuthContext"; // Import the useAuth hook

// Login component with a user-friendly form
function Login() {
  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State for loading and error feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use the useAuth hook for login function and auth state
  const { login, isAuthenticated } = useAuth();

  // Use useNavigate for redirection
  const navigate = useNavigate();

  // Effect to redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/documents"); // Redirect to documents page if already logged in
    }
  }, [isAuthenticated, navigate]); // Depend on isAuthenticated and navigate

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission

    // Basic validation
    if (!email || !password) {
      return setError("Please enter both email and password");
    }

    setError(""); // Clear previous errors
    setLoading(true); // Set loading state

    try {
      const res = await login(email, password); // Call login function from AuthContext

      if (res && res.success) {
        // Login successful, redirect to documents page
        navigate("/documents");
      } else {
        // Handle API specific failure messages from authService if success: false is returned
        setError(
          res?.message || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      // Handle errors thrown by authService (e.g., network errors, server errors)
      setError(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false); // Clear loading state regardless of success or failure
    }
  };

  // If already authenticated, render nothing or a loading spinner briefly before redirect
  if (isAuthenticated) {
    return null; // Or a loading indicator
  }

  return (
    <Container className="d-flex justify-content-center">
      {" "}
      {/* Center the card */}
      <Card style={{ width: "100%", maxWidth: "400px" }}>
        {" "}
        {/* Card for the form, setting max-width */}
        <Card.Body>
          <h2 className="text-center mb-4">Login</h2> {/* Centered heading */}
          {/* Display error alert if error state is not empty */}
          {error && <Alert variant="danger">{error}</Alert>}
          {/* Login Form */}
          <Form onSubmit={handleSubmit}>
            {/* Email Field */}
            <Form.Group className="mb-3" controlId="formBasicEmail">
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
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required // HTML5 required attribute
              />
            </Form.Group>

            {/* Submit Button */}
            <Button
              variant="primary"
              type="submit"
              className="w-100" // Make button full width
              disabled={loading} // Disable button while loading
            >
              {loading ? "Logging In..." : "Login"}{" "}
              {/* Change button text while loading */}
            </Button>
          </Form>
          {/* Link to Register Page */}
          <div className="w-100 text-center mt-3">
            Need an account? <Link to="/register">Sign Up</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
