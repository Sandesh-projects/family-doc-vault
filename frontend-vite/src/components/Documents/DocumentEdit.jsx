// frontend/src/components/Documents/DocumentEdit.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap"; // Import Bootstrap components
import documentService from "../../services/documentService"; // Import document service
// import { useAuth } from '../../context/AuthContext'; // Optional: for client-side ownership check

// DocumentEdit component for updating document metadata
function DocumentEdit() {
  // Get the document ID from the URL parameters
  const { id } = useParams();
  const navigate = useNavigate(); // Hook for navigation

  // State for form inputs, initially empty
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");

  // State to hold the original fetched document data (optional, but useful)
  const [originalDocumentData, setOriginalDocumentData] = useState(null);

  // State for UI feedback
  const [loading, setLoading] = useState(true); // Loading initial data
  const [saving, setSaving] = useState(false); // Saving updates
  const [error, setError] = useState(""); // Error state
  const [successMessage, setSuccessMessage] = useState(""); // Success state

  // Optional: Get current user ID for client-side ownership check (backend is primary)
  // const { user } = useAuth();

  // Effect to fetch document details on component mount or ID change
  useEffect(() => {
    const fetchDocumentDetails = async () => {
      setLoading(true); // Start loading
      setError(""); // Clear previous errors
      setOriginalDocumentData(null); // Clear previous data

      try {
        const response = await documentService.getDocumentDetails(id); // Fetch document details

        if (response && response.success && response.data) {
          const fetchedDoc = response.data;
          setOriginalDocumentData(fetchedDoc); // Store original data

          // Populate form fields with fetched data
          setDocumentType(fetchedDoc.documentType || "");
          setDescription(fetchedDoc.description || "");

          // --- Client-side Authorization Check (Optional) ---
          // If you have user ID from auth context and document's userId
          // const currentUserId = user?._id; // Get user ID from AuthContext
          // if (fetchedDoc.userId && currentUserId && fetchedDoc.userId.toString() !== currentUserId.toString()) {
          //      setError('You are not authorized to edit this document.');
          //      // Optionally redirect away
          //      // navigate(`/documents/${id}`);
          // }
          // --- End Client-side Check ---
        } else {
          // Handle API specific failure or 404
          setError(
            response?.message || "Failed to load document details for editing."
          );
          setOriginalDocumentData(null); // Indicate data was not loaded
        }
      } catch (err) {
        // Handle network errors or backend 403/404 errors thrown by service
        setError(
          err.message ||
            "An unexpected error occurred while loading document details."
        );
        setOriginalDocumentData(null);
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
  }, [id /*, user?._id*/]); // Depend on ID and optionally user ID if doing client-side auth check

  // Handle form submission for updating document metadata
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Cannot save if no original data was loaded (likely due to error/404 or auth failure)
    if (!originalDocumentData) {
      setError("Cannot save changes. Document data was not loaded.");
      return;
    }

    // --- Client-side Validation ---
    if (!documentType) {
      return setError("Document type is required.");
    }
    // --- End Validation ---

    setError(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages
    setSaving(true); // Set saving state

    try {
      // Prepare data for update
      const updateData = {
        documentType,
        description,
      };

      const response = await documentService.updateDocument(id, updateData); // Call the updateDocument service

      if (response && response.success) {
        setSuccessMessage("Document updated successfully!"); // Show success message
        console.log("Document updated:", response.data);

        // Optionally, redirect back to document details after a delay
        setTimeout(() => {
          navigate(`/documents/${id}`); // Redirect after 2 seconds
        }, 2000);
      } else {
        setError(response?.message || "Failed to update document.");
      }
    } catch (err) {
      // Handle API errors (including backend 403 if not owner)
      setError(
        err.message || "An unexpected error occurred during document update."
      );
    } finally {
      setSaving(false); // Clear saving state
    }
  };

  // Common document types (same as upload)
  const commonDocumentTypes = [
    "Mark Sheet",
    "PAN Card",
    "Passport",
    "Driving License",
    "Birth Certificate",
    "Aadhaar Card",
    "Vaccination Certificate",
    "Medical Report",
    "Other",
  ];

  // If loading initial data, show a spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Document Data...</span>
        </Spinner>
      </div>
    );
  }

  // If there's an error after loading, show an alert
  // This also handles the case where user is not authorized to view/edit (backend returns 403/404, service throws error)
  if (error && !saving) {
    // Only show error if not actively saving
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  // If no document data loaded and no error (shouldn't happen, but as fallback)
  if (!originalDocumentData && !loading && !error) {
    return (
      <Alert variant="info">Could not load document data for editing.</Alert>
    );
  }

  // Render the edit form
  return (
    <Card>
      {" "}
      {/* Card wrapper */}
      <Card.Body>
        <Card.Title className="mb-4">Edit Document Metadata</Card.Title>{" "}
        {/* Title */}
        <Card.Subtitle className="mb-3 text-muted">
          File: {originalDocumentData?.fileName}
        </Card.Subtitle>{" "}
        {/* Show filename */}
        {/* Display feedback messages */}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}{" "}
        {/* Show error while saving too */}
        {/* Edit Form */}
        <Form onSubmit={handleSubmit}>
          {/* Document Type */}
          <Form.Group className="mb-3" controlId="editDocFormType">
            <Form.Label>Document Type</Form.Label>
            <Form.Select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
              disabled={saving} // Disable while saving
            >
              <option value="">-- Select Type --</option>
              {commonDocumentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Description */}
          <Form.Group className="mb-3" controlId="editDocFormDescription">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Add a brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving} // Disable while saving
            />
          </Form.Group>

          {/* Note about file content */}
          <p className="text-muted mt-4">
            Note: This form only updates document metadata. The file content
            cannot be changed here.
          </p>

          {/* Action Buttons */}
          <div className="mt-4">
            <Button
              variant="primary"
              type="submit"
              className="me-2"
              disabled={saving} // Disable button while saving
            >
              {saving ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-1"
                />
              ) : (
                "Save Changes"
              )}{" "}
              {/* Change button text/icon */}
            </Button>

            {/* Cancel Button */}
            <Button
              variant="secondary"
              onClick={() => navigate(`/documents/${id}`)}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default DocumentEdit;
