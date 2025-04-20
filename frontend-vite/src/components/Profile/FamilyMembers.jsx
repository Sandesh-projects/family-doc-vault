// frontend-vite/src/components/Profile/FamilyMembers.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  ListGroup,
  Alert,
  Spinner,
  Form,
  Modal,
} from "react-bootstrap"; // Import Bootstrap components
import { useAuth } from "../../context/AuthContext"; // Import useAuth hook
import userService from "../../services/userService"; // Import user service

// FamilyMembers component to manage linked family members
function FamilyMembers() {
  // State for the detailed family member user objects
  const [familyMembers, setFamilyMembers] = useState([]);
  // State for loading the initial list of members' details
  const [loading, setLoading] = useState(true);
  // State for errors (fetch or action errors)
  const [error, setError] = useState("");

  // State for the "Add Family Member" modal
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [identifier, setIdentifier] = useState(""); // Input for email or Aadhaar
  const [identifierType, setIdentifierType] = useState("email"); // 'email' or 'aadhaarNumber'
  const [addingMember, setAddingMember] = useState(false); // Loading state for adding

  // State to track which member is currently being removed (for showing spinner per item)
  const [removingMemberId, setRemovingMemberId] = useState(null);

  // Use useAuth hook to get the current user's profile containing family member IDs
  const { user, logout, login } = useAuth(); // Need login/logout potentially to refresh context user after update

  // Effect to fetch details for linked family members when user or familyMembers IDs change
  useEffect(() => {
    // --- Debug Log 1: Check user object from context ---
    console.log("FamilyMembers Component - useEffect triggered.");
    console.log("User object from AuthContext:", user);
    console.log(
      "User familyMembers IDs from AuthContext:",
      user?.familyMembers
    );
    // --- End Debug Log 1 ---

    // Only attempt to fetch if user and their familyMembers array are available
    if (!user || !user.familyMembers || user.familyMembers.length === 0) {
      setFamilyMembers([]); // Ensure empty array if no members
      setLoading(false);
      console.log(
        "FamilyMembers Component - No user or no family members in context. Stopping fetch."
      );
      return;
    }

    const fetchFamilyMemberDetails = async () => {
      setLoading(true); // Start loading member details
      setError(""); // Clear previous errors
      try {
        // Fetch details for each family member ID
        // This sends multiple API calls. In a real-world, high-performance app,
        // you'd ideally have a backend endpoint to fetch multiple users by ID.
        const memberDetailsPromises = user.familyMembers.map((memberId) => {
          // --- Debug Log 2: Logging ID before fetching details ---
          console.log(
            "FamilyMembers Component - Fetching details for member ID:",
            memberId
          );
          // --- End Debug Log 2 ---
          return userService.getUserById(memberId); // Call the getUserById service for each ID
        });

        const responses = await Promise.all(memberDetailsPromises); // Execute calls in parallel

        const fetchedMembers = responses
          .filter((res) => {
            // --- Debug Log 3: Logging response for each member detail fetch ---
            console.log(
              "FamilyMembers Component - Response for member detail fetch:",
              res
            );
            // --- End Debug Log 3 ---
            return res && res.success && res.data; // Filter out failed fetches
          })
          .map((res) => res.data); // Extract the user data

        setFamilyMembers(fetchedMembers); // Update state with detailed member objects
        console.log(
          "FamilyMembers Component - Successfully fetched detailed members:",
          fetchedMembers
        );
      } catch (err) {
        setError(
          err.message ||
            "An unexpected error occurred while fetching family member details."
        );
        setFamilyMembers([]); // Clear list on error
        console.error(
          "FamilyMembers Component - Error during fetchFamilyMemberDetails:",
          err
        );
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchFamilyMemberDetails(); // Call the fetch function

    // Depend on user._id and user.familyMembers array length.
    // The refetchCurrentUser function is intended to update the 'user' object in context,
    // which should ideally trigger this effect if familyMembers array changes.
  }, [user?._id, user?.familyMembers?.length]); // Dependency on user ID and array length (basic trigger)

  // Helper to refetch the current user's data after add/remove
  // This ensures the familyMembers list in AuthContext is updated, triggering the useEffect above.
  const refetchCurrentUser = async () => {
    try {
      console.log(
        "FamilyMembers Component - Attempting to refetch current user data."
      );
      const response = await userService.getMe();
      if (response?.success) {
        console.log(
          "FamilyMembers Component - Successfully refetched user data:",
          response.data
        );
        // Update the user in AuthContext by calling login
        // This is a bit of a workaround; ideally, AuthContext would have an updateUserData function
        // Calling login with email and empty password updates the context user state if successful
        // It relies on the login function being designed to update state even without re-authenticating if token is valid
        login(user.email, ""); // Use the login function to update context state
        console.log(
          "FamilyMembers Component - Updated AuthContext user state."
        );
      } else {
        console.error(
          "FamilyMembers Component - Failed to refetch user data:",
          response?.message
        );
        setError(response?.message || "Failed to refresh user data.");
      }
    } catch (err) {
      console.error(
        "FamilyMembers Component - Error refreshing user data:",
        err
      );
      setError(err.message || "Error refreshing user data.");
    }
  };

  // --- Add Family Member Modal Handling ---
  const handleAddMemberClick = () => setAddMemberModalOpen(true);
  const handleCloseAddMemberModal = () => {
    setAddMemberModalOpen(false);
    setIdentifier(""); // Reset form field
    setIdentifierType("email"); // Reset identifier type
    setError(""); // Clear modal error
    setAddingMember(false);
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    // Client-side validation
    if (!identifier) {
      return setError("Please enter an identifier.");
    }
    if (identifierType === "aadhaarNumber" && !/^\d{12}$/.test(identifier)) {
      return setError("Please enter a valid 12-digit Aadhaar number.");
    }

    setError(""); // Clear previous errors
    setAddingMember(true); // Set adding loading state
    console.log(
      "FamilyMembers Component - Submitting add family member request."
    );

    try {
      const response = await userService.addFamilyMember({
        identifier,
        identifierType,
      });

      if (response && response.success) {
        // Member added successfully
        console.log(
          "FamilyMembers Component - Family member added successfully:",
          response.data
        );
        handleCloseAddMemberModal(); // Close the modal
        refetchCurrentUser(); // Refetch user data to update the list in context
      } else {
        console.error(
          "FamilyMembers Component - Add family member failed:",
          response?.message
        );
        setError(response?.message || "Failed to add family member.");
      }
    } catch (err) {
      console.error(
        "FamilyMembers Component - Error during add family member:",
        err
      );
      setError(
        err.message ||
          "An unexpected error occurred while adding family member."
      );
    } finally {
      setAddingMember(false); // Clear adding loading state
    }
  };

  // --- Remove Family Member Handling ---
  const handleRemoveMember = async (memberId) => {
    if (
      !window.confirm("Are you sure you want to unlink this family member?")
    ) {
      return; // Ask for confirmation
    }

    setRemovingMemberId(memberId); // Set removing state for this specific member
    setError(""); // Clear general errors
    console.log(
      "FamilyMembers Component - Attempting to remove family member:",
      memberId
    );

    try {
      const response = await userService.removeFamilyMember(memberId);

      if (response && response.success) {
        console.log(
          "FamilyMembers Component - Family member removed successfully:",
          response.data
        );
        refetchCurrentUser(); // Refetch user data to update the list in context
      } else {
        console.error(
          "FamilyMembers Component - Remove family member failed:",
          response?.message
        );
        setError(response?.message || "Failed to remove family member.");
      }
    } catch (err) {
      console.error(
        "FamilyMembers Component - Error during remove family member:",
        err
      );
      setError(
        err.message ||
          "An unexpected error occurred while removing family member."
      );
    } finally {
      setRemovingMemberId(null); // Clear removing state
    }
  };

  // If loading initial data, show a spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Family Members...</span>
        </Spinner>
      </div>
    );
  }

  // If there's an error after loading the initial list
  if (error && !addMemberModalOpen && removingMemberId === null) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  // Render the family members list and add button
  return (
    <Card>
      {" "}
      {/* Bootstrap Card */}
      <Card.Body>
        <Card.Title className="text-center mb-4">Family Members</Card.Title>{" "}
        {/* Centered Title */}
        {/* General error alert */}
        {error && <Alert variant="danger">{error}</Alert>}
        {/* List of Family Members */}
        {familyMembers.length > 0 ? (
          <ListGroup variant="flush">
            {familyMembers.map((member) => (
              <ListGroup.Item
                key={member._id}
                className="d-flex justify-content-between align-items-center"
              >
                {/* Display member's name and email if available */}
                <div>
                  <strong>{member.name || "Unnamed User"}</strong>
                  <br />
                  <small className="text-muted">{member.email}</small>
                  {/* Optional: Display Aadhaar if needed and authorized */}
                  {/* {member.aadhaarNumber && <><br/><small className="text-muted">Aadhaar: {member.aadhaarNumber}</small></>} */}
                  <br />
                  <small className="text-muted">
                    User ID: {member._id}
                  </small>{" "}
                  {/* Displaying ID for clarity */}
                </div>
                {/* Remove Button */}
                <Button
                  variant="danger"
                  size="sm" // Small button
                  onClick={() => handleRemoveMember(member._id)}
                  disabled={
                    removingMemberId === member._id || addingMember || loading
                  } // Disable while removing, adding, or initial loading
                >
                  {removingMemberId === member._id ? (
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-1"
                    />
                  ) : (
                    "Remove"
                  )}
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          // Message if no family members are linked
          <Alert variant="info" className="text-center">
            No family members linked yet.
          </Alert>
        )}
        {/* Add Family Member Button */}
        <div className="mt-4 text-center">
          {" "}
          {/* Center button */}
          <Button
            variant="primary"
            onClick={handleAddMemberClick}
            disabled={addingMember || loading}
          >
            Link Family Member
          </Button>
        </div>
      </Card.Body>
      {/* --- Add Family Member Modal --- */}
      <Modal show={addMemberModalOpen} onHide={handleCloseAddMemberModal}>
        <Modal.Header closeButton>
          <Modal.Title>Link Family Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Display modal error alert */}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleAddMemberSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Identify by:</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="radio"
                  label="Email"
                  name="identifierType"
                  id="identifierTypeEmail"
                  value="email"
                  checked={identifierType === "email"}
                  onChange={() => setIdentifierType("email")}
                  disabled={addingMember}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Aadhaar Number"
                  name="identifierType"
                  id="identifierTypeAadhaar"
                  value="aadhaarNumber"
                  checked={identifierType === "aadhaarNumber"}
                  onChange={() => setIdentifierType("aadhaarNumber")}
                  disabled={addingMember}
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3" controlId="identifierInput">
              <Form.Label>
                {identifierType === "email"
                  ? "Email Address"
                  : "Aadhaar Number"}
              </Form.Label>
              <Form.Control
                type={identifierType === "email" ? "email" : "text"}
                placeholder={`Enter ${
                  identifierType === "email"
                    ? "email"
                    : "12-digit Aadhaar number"
                }`}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={addingMember}
                maxLength={identifierType === "aadhaarNumber" ? 12 : undefined} // Limit length for Aadhaar
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={addingMember}>
              {addingMember ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-1"
                />
              ) : (
                "Link Member"
              )}
            </Button>
            {/* Optional: Add a Cancel button */}
            {/* <Button variant="secondary" onClick={handleCloseAddMemberModal} className="ms-2">Cancel</Button> */}
          </Form>
        </Modal.Body>
      </Modal>
    </Card>
  );
}

export default FamilyMembers;
