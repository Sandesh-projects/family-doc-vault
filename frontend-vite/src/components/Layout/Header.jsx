// frontend/src/components/Layout/Header.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Link for navigation, useNavigate for logout redirect
import { Navbar, Nav, Container, NavLink } from "react-bootstrap"; // Import Bootstrap components
import { useAuth } from "../../context/AuthContext"; // Import the useAuth hook

// Header component for site navigation
function Header() {
  // Use the useAuth hook to access auth state and logout function
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate(); // Hook to navigate programmatically

  // Handle logout action
  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    navigate("/login"); // Redirect to the login page after logout
  };

  return (
    <header>
      {" "}
      {/* Semantic header tag */}
      <Navbar bg="primary" variant="dark" expand="lg" collapseOnSelect>
        {" "}
        {/* Bootstrap Navbar */}
        <Container>
          {" "}
          {/* Use Container for alignment */}
          {/* Brand/Project Name */}
          {/* Link to documents if authenticated, otherwise link to login */}
          <Navbar.Brand
            as={Link}
            to={isAuthenticated ? "/documents" : "/login"}
          >
            FamilyDocVault
          </Navbar.Brand>
          {/* Navbar Toggler for small screens */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          {/* Collapsible Navbar Content */}
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {" "}
              {/* ms-auto pushes links to the right */}
              {isAuthenticated ? (
                // --- Links for Authenticated Users ---
                <>
                  {" "}
                  {/* Fragment to group multiple elements */}
                  <NavLink as={Link} to="/documents" eventKey="documents">
                    Documents
                  </NavLink>
                  {/* You can display user's name or email if available */}
                  {/* {user && ( */}
                  {/* <NavLink as={Link} to="/profile" eventKey="profile-link"> */}
                  {/* {user.name || user.email} Display name or email */}
                  {/* </NavLink> */}
                  {/* )} */}
                  <NavLink as={Link} to="/profile" eventKey="profile">
                    Profile
                  </NavLink>
                  {/* Logout is typically a button or a link with a click handler */}
                  <NavLink
                    onClick={handleLogout}
                    eventKey="logout"
                    style={{ cursor: "pointer" }}
                  >
                    Logout
                  </NavLink>
                </>
              ) : (
                // --- Links for Guests (Not Authenticated) ---
                <>
                  <NavLink as={Link} to="/login" eventKey="login">
                    Login
                  </NavLink>
                  <NavLink as={Link} to="/register" eventKey="register">
                    Register
                  </NavLink>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;
