// frontend/src/components/Documents/DocumentDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Import useParams, useNavigate, Link
import { Card, ListGroup, Button, Spinner, Alert } from "react-bootstrap"; // Import Bootstrap components
import documentService from "../../services/documentService"; // Import document service
// import { useAuth } from '../../context/AuthContext'; // Optional: if needing current user for checks

// DocumentDetails component to display details of a single document
function DocumentDetails() {
  // Get the document ID from the URL parameters
  const { id } = useParams();
  const navigate = useNavigate(); // Hook for navigation

  // State for the document data and UI feedback
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state for fetching details
  const [error, setError] = useState(""); // Error state for fetch errors
  const [deleting, setDeleting] = useState(false); // Loading state for deletion

  // Optional: Get current user ID from AuthContext if doing client-side checks (backend is primary)
  // const { user } = useAuth();

  // Effect to fetch document details when the component mounts or the document ID changes
  useEffect(() => {
    const fetchDocumentDetails = async () => {
      setLoading(true); // Start loading
      setError(""); // Clear previous errors
      setDocumentData(null); // Clear previous data

      try {
        const response = await documentService.getDocumentDetails(id); // Call the getDocumentDetails service

        if (response && response.success && response.data) {
          setDocumentData(response.data); // Set the fetched document data
          console.log("Fetched document details:", response.data);
        } else {
          setError(response?.message || "Failed to fetch document details.");
          setDocumentData(null);
        }
      } catch (err) {
        setError(
          err.message ||
            "An unexpected error occurred while fetching document details."
        );
        setDocumentData(null);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    if (id) {
      // Fetch only if ID is available
      fetchDocumentDetails();
    } else {
      setError("No document ID provided.");
      setLoading(false);
    }
  }, [id]); // Depend on the document ID from the URL

  // --- Action Handlers ---

  // Handle document deletion
  const handleDelete = async () => {
    if (!documentData) return; // Cannot delete if no document data loaded
    if (
      !window.confirm(
        `Are you sure you want to delete "${documentData.fileName}"?`
      )
    ) {
      return; // Ask for confirmation
    }

    setDeleting(true); // Set deleting state
    setError(""); // Clear general errors

    try {
      const response = await documentService.deleteDocument(documentData._id);

      if (response && response.success) {
        console.log("Document deleted successfully.");
        // Redirect to the document list after successful deletion
        navigate("/documents");
        // Consider showing a small success toast/message on the list page
      } else {
        setError(response?.message || "Failed to delete document.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred during deletion.");
    } finally {
      setDeleting(false); // Clear deleting state
    }
  };

  // Handle document download
  const handleDownload = async () => {
    if (!documentData) return; // Cannot download if no document data loaded
    setError(""); // Clear previous errors

    try {
      // documentService.downloadDocument handles the client-side download logic
      await documentService.downloadDocument(
        documentData._id,
        documentData.fileName
      );
      // Success feedback is handled internally by the download initiation
    } catch (err) {
      setError(err.message || "An error occurred during download.");
    }
  };

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // If loading, show a spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Document Details...</span>
        </Spinner>
      </div>
    );
  }

  // If there's an error after loading, show an alert
  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  // If no document data after loading (e.g., not found), show a message
  if (!documentData) {
    // This case should be covered by the error state, but as a fallback:
    return <Alert variant="info">Document not found.</Alert>;
  }

  // Determine if the current user is the owner (assuming backend provides userId)
  // The backend should also provide a flag like 'isOwner' for cleaner frontend logic
  // For now, let's rely on the backend Document model's structure
  const isOwner =
    documentData.userId &&
    documentData.userId.toString() ===
      (localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))._id
        : null); // Basic check from local user ID

  // Render the document details
  return (
    <Card>
      {" "}
      {/* Card wrapper */}
      <Card.Body>
        <Card.Title className="mb-4">{documentData.fileName}</Card.Title>{" "}
        {/* Document Title */}
        {/* Error alert for actions */}
        {error && <Alert variant="danger">{error}</Alert>}
        {/* Document Details List */}
        <ListGroup variant="flush">
          {" "}
          {/* ListGroup for details */}
          <ListGroup.Item>
            <strong>Type:</strong> {documentData.documentType}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Uploaded On:</strong>{" "}
            {new Date(documentData.createdAt).toLocaleDateString()} at{" "}
            {new Date(documentData.createdAt).toLocaleTimeString()}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>File Size:</strong> {formatFileSize(documentData.fileSize)}
          </ListGroup.Item>
          {/* Assuming backend populated userId with just the ID or a basic user object */}
          {/* If backend populates userId with full user object, you'd access documentData.userId.name etc. */}
          <ListGroup.Item>
            <strong>Uploaded By User ID:</strong> {documentData.userId}
          </ListGroup.Item>{" "}
          {/* Displaying just the ID */}
          <ListGroup.Item>
            <strong>Description:</strong> {documentData.description || "None"}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Shared With:</strong>
            {/* Display list of shared user IDs */}
            {documentData.sharedWith && documentData.sharedWith.length > 0 ? (
              <ListGroup variant="flush" className="mt-2">
                {documentData.sharedWith.map((memberId) => (
                  // In a real app, you might fetch names/emails for these IDs
                  <ListGroup.Item key={memberId}>
                    User ID: {memberId}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="mt-2 mb-0">Not shared with anyone yet.</p>
            )}
          </ListGroup.Item>
        </ListGroup>
        {/* Action Buttons */}
        <div className="mt-4">
          {" "}
          {/* Action button container */}
          {/* Download Button */}
          <Button
            variant="secondary"
            onClick={handleDownload}
            className="me-2"
            disabled={loading || deleting}
          >
            Download
          </Button>
          {/* Conditionally render Edit, Delete, Share based on ownership/authorization */}
          {/* This client-side check is a hint; backend authorization is the source of truth */}
          {/* Assuming backend provides documentData.isOwner flag or similar */}
          {isOwner && ( // Basic client-side check based on userId match (needs backend confirmation)
            <>
              {/* Edit Button */}
              <Button
                as={Link}
                to={`/documents/${documentData._id}/edit`}
                variant="primary"
                className="me-2"
                disabled={loading || deleting}
              >
                Edit
              </Button>

              {/* Delete Button */}
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={loading || deleting}
              >
                {deleting ? (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-1"
                  />
                ) : (
                  "Delete"
                )}
              </Button>

              {/* Share Button */}
              <Button
                as={Link}
                to={`/documents/${documentData._id}/share`}
                variant="secondary"
                className="ms-2"
                disabled={loading || deleting}
              >
                Share
              </Button>
            </>
          )}
          {/* Back to list button */}
          <div className="mt-3">
            <Button
              variant="outline-secondary"
              onClick={() => navigate("/documents")}
            >
              Back to Documents List
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default DocumentDetails;
