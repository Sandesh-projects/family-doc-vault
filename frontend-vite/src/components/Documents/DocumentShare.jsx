// frontend/src/components/Documents/DocumentShare.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import { Card, Button, Form, ListGroup, Alert, Spinner } from "react-bootstrap"; // Import Bootstrap components
import documentService from "../../services/documentService"; // Import document service
import userService from "../../services/userService"; // Import user service
import { useAuth } from "../../context/AuthContext"; // Import useAuth hook

// DocumentShare component for sharing a document with family members
function DocumentShare() {
  // Get the document ID from the URL parameters
  const { id } = useParams();
  const navigate = useNavigate(); // Hook for navigation

  // State for fetched data
  const [documentData, setDocumentData] = useState(null);
  const [ownerFamilyMembers, setOwnerFamilyMembers] = useState([]); // Detailed user objects of family members

  // State for the selected family members to share with (array of user IDs)
  const [selectedMembers, setSelectedMembers] = useState([]);

  // State for UI feedback
  const [loadingDocument, setLoadingDocument] = useState(true); // Loading doc details
  const [loadingFamily, setLoadingFamily] = useState(true); // Loading family members
  const [sharing, setSharing] = useState(false); // Sharing process loading
  const [error, setError] = useState(""); // Error state
  const [successMessage, setSuccessMessage] = useState(""); // Success state

  // Get the current authenticated user (potential owner)
  const { user } = useAuth();
  const currentUserId = user?._id;

  // Effect to fetch document details and the owner's family members
  useEffect(() => {
    const fetchDocumentAndFamily = async () => {
      setLoadingDocument(true);
      setLoadingFamily(true);
      setError("");
      setDocumentData(null);
      setOwnerFamilyMembers([]);

      try {
        // --- Fetch Document Details ---
        const docResponse = await documentService.getDocumentDetails(id);
        if (docResponse?.success && docResponse.data) {
          const fetchedDoc = docResponse.data;
          setDocumentData(fetchedDoc);

          // --- Client-side Ownership Check (Optional, but good for UX) ---
          // Rely on backend authorization as primary, but hint here
          if (
            fetchedDoc.userId &&
            currentUserId &&
            fetchedDoc.userId.toString() !== currentUserId.toString()
          ) {
            setError("You are not authorized to share this document.");
            setLoadingDocument(false); // Stop loading if unauthorized
            setLoadingFamily(false);
            return; // Stop further fetching if not authorized
          }
          // --- End Client-side Check ---

          // --- Fetch Owner's Family Members ---
          // Fetch the owner's profile to get the latest list of family member IDs
          const ownerProfileResponse = await userService.getMe(); // Fetching own profile
          if (ownerProfileResponse?.success && ownerProfileResponse.data) {
            const ownerProfile = ownerProfileResponse.data;

            if (
              ownerProfile.familyMembers &&
              ownerProfile.familyMembers.length > 0
            ) {
              // Fetch details for each family member ID
              const memberDetailsPromises = ownerProfile.familyMembers.map(
                (memberId) => userService.getUserById(memberId) // Fetch details for each family member
              );

              const memberResponses = await Promise.all(memberDetailsPromises); // Execute in parallel

              const fetchedMembers = memberResponses
                .filter((res) => res?.success && res.data) // Filter successful fetches
                .map((res) => res.data); // Extract user data

              setOwnerFamilyMembers(fetchedMembers); // Set state with detailed family members
              console.log(
                `Workspaceed details for ${fetchedMembers.length} family members.`
              );

              // Optional: Pre-select members this document is already shared with
              if (fetchedDoc.sharedWith) {
                const alreadySharedIds = fetchedDoc.sharedWith.map((shareId) =>
                  shareId.toString()
                );
                const initiallySelected = fetchedMembers
                  .filter((member) =>
                    alreadySharedIds.includes(member._id.toString())
                  )
                  .map((member) => member._id.toString());
                setSelectedMembers(initiallySelected);
              }
            } else {
              setOwnerFamilyMembers([]); // No family members linked
              console.log("No family members linked for the owner.");
            }
          } else {
            // Handle error fetching owner profile
            setError(
              ownerProfileResponse?.message ||
                "Failed to fetch your family members list."
            );
            setOwnerFamilyMembers([]);
          }
        } else {
          // Handle error fetching document details (e.g., 404, 403)
          setError(
            docResponse?.message ||
              "Failed to fetch document details for sharing."
          );
          setDocumentData(null); // Clear doc data if fetch failed
          setOwnerFamilyMembers([]); // Clear family data too
        }
      } catch (err) {
        // Handle API call errors
        setError(
          err.message ||
            "An unexpected error occurred while loading data for sharing."
        );
        setDocumentData(null);
        setOwnerFamilyMembers([]);
      } finally {
        setLoadingDocument(false); // Stop loading document
        setLoadingFamily(false); // Stop loading family members
      }
    };

    if (id && currentUserId) {
      // Fetch only if ID and current user ID are available
      fetchDocumentAndFamily();
    } else if (!id) {
      setError("No document ID provided for sharing.");
      setLoadingDocument(false);
      setLoadingFamily(false);
    }
  }, [id, currentUserId]); // Depend on document ID and current user ID

  // Handle selection/deselection of a family member checkbox
  const handleMemberSelect = (memberId) => {
    setSelectedMembers((prevSelectedMembers) => {
      if (prevSelectedMembers.includes(memberId)) {
        // Member is already selected, remove them
        return prevSelectedMembers.filter((id) => id !== memberId);
      } else {
        // Member is not selected, add them
        return [...prevSelectedMembers, memberId];
      }
    });
  };

  // Handle the share form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Cannot share if document data wasn't loaded or user isn't owner
    if (
      !documentData ||
      (documentData.userId &&
        currentUserId &&
        documentData.userId.toString() !== currentUserId.toString())
    ) {
      setError(
        "Cannot share. Document data was not loaded or you are not authorized."
      );
      return;
    }

    // --- Client-side Validation ---
    if (selectedMembers.length === 0) {
      return setError(
        "Please select at least one family member to share with."
      );
    }
    // --- End Validation ---

    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages
    setSharing(true); // Set sharing state

    try {
      const response = await documentService.shareDocument(id, selectedMembers); // Call the shareDocument service

      if (response?.success) {
        setSuccessMessage("Document shared successfully!"); // Show success message
        console.log("Document shared:", response.data);

        // Optionally, redirect back to document details after a delay
        setTimeout(() => {
          navigate(`/documents/${id}`); // Redirect after 2 seconds
        }, 2000);
      } else {
        setError(response?.message || "Failed to share document.");
      }
    } catch (err) {
      // Handle API errors (including backend 403 if not owner)
      setError(err.message || "An unexpected error occurred during sharing.");
    } finally {
      setSharing(false); // Clear sharing state
    }
  };

  // Determine if the current user is the owner (for disabling form if not)
  // This relies on documentData and currentUserId being available after loading
  const isOwner =
    documentData?.userId &&
    currentUserId &&
    documentData.userId.toString() === currentUserId.toString();
  const isLoading = loadingDocument || loadingFamily;

  // Render the sharing component
  return (
    <Card>
      {" "}
      {/* Card wrapper */}
      <Card.Body>
        <Card.Title className="mb-4">Share Document</Card.Title> {/* Title */}
        <Card.Subtitle className="mb-3 text-muted">
          Sharing: {documentData?.fileName || "Loading..."}
        </Card.Subtitle>{" "}
        {/* Show filename */}
        {/* Display feedback messages */}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        {/* Loading spinners */}
        {isLoading && (
          <div className="d-flex justify-content-center mt-3">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">
                {loadingDocument
                  ? "Loading Document..."
                  : "Loading Family Members..."}
              </span>
            </Spinner>
          </div>
        )}
        {/* Content or Unauthorized Message */}
        {!isLoading && !error && !isOwner && (
          <Alert variant="warning">
            You can only share documents that you own.
          </Alert>
        )}
        {/* Sharing Form (Visible if owner and loaded) */}
        {!isLoading && !error && isOwner && (
          <Form onSubmit={handleSubmit}>
            {/* List of Family Members to Select */}
            <Form.Group className="mb-3">
              <Form.Label>Select Family Members to Share With:</Form.Label>
              {ownerFamilyMembers.length > 0 ? (
                <ListGroup>
                  {ownerFamilyMembers.map((member) => (
                    <ListGroup.Item key={member._id}>
                      <Form.Check
                        type="checkbox"
                        id={`checkbox-${member._id}`}
                        label={`${member.name || "Unnamed User"} (${
                          member.email
                        })`}
                        checked={selectedMembers.includes(
                          member._id.toString()
                        )}
                        onChange={() =>
                          handleMemberSelect(member._id.toString())
                        }
                        disabled={sharing} // Disable checkboxes while sharing
                      />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                // Message if the owner has no family members linked
                <Alert variant="info" className="text-center mt-3 mb-0">
                  You have no family members linked to share with.
                  <br />
                  <Button
                    variant="link"
                    onClick={() => navigate("/profile/family")}
                    className="p-0"
                  >
                    Link family members
                  </Button>{" "}
                  in your profile.
                </Alert>
              )}
            </Form.Group>

            {/* Share Button */}
            <div className="mt-4">
              <Button
                variant="primary"
                type="submit"
                disabled={sharing || ownerFamilyMembers.length === 0} // Disable if sharing or no members to select
              >
                {sharing ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-1"
                  />
                ) : (
                  "Share Document"
                )}
              </Button>
              {ownerFamilyMembers.length === 0 && !sharing && (
                <small className="text-muted ms-2">
                  Link family members first.
                </small>
              )}
            </div>
          </Form>
        )}
        {/* Back to details button */}
        {!isLoading && ( // Show back button once loading is done
          <div className="mt-3">
            <Button
              variant="outline-secondary"
              onClick={() => navigate(`/documents/${id}`)}
            >
              Back to Document Details
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default DocumentShare;
// This component allows users to share documents with their family members. It fetches the document details and the owner's family members, allowing the owner to select which family members to share the document with. The component handles loading states, errors, and success messages for a smooth user experience.
// It also includes a back button to navigate back to the document details page.
// The component uses React hooks for state management and side effects, and Bootstrap for styling and layout. The documentService and userService are used to interact with the backend API for fetching document and user data.
// The useAuth hook is used to access the current authenticated user's information.
