// frontend/src/components/Documents/DocumentList.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate
import {
  Table,
  Button,
  Spinner,
  Alert,
  Pagination,
  Form,
  Card,
} from "react-bootstrap"; // Import Bootstrap components
// import { useAuth } from "../../context/AuthContext"; // Not strictly needed here
import documentService from "../../services/documentService"; // Import document service

// DocumentList component to display user's documents
function DocumentList() {
  // State for document data and UI feedback
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state for fetching list
  const [error, setError] = useState(""); // Error state for fetch errors

  // State for filtering and pagination
  const [filter, setFilter] = useState("owned"); // 'owned', 'shared', or 'all'
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [itemsPerPage, setItemsPerPage] = useState(10); // Items per page (can be user selectable)
  const [totalDocuments, setTotalDocuments] = useState(0); // Total documents for pagination

  // State for action feedback (e.g., deleting)
  const [removingDocumentId, setRemovingDocumentId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // State to manually trigger useEffect

  // Use useNavigate for navigation (e.g., after deletion)
  const navigate = useNavigate();

  // Effect to fetch documents based on filter, page, and limit
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true); // Start loading
      setError(""); // Clear previous errors

      try {
        // Prepare filter parameters for the API call
        const filters = {
          page: currentPage,
          limit: itemsPerPage,
          // Add filter params based on state
          ...(filter === "owned" && { owned: true }),
          ...(filter === "shared" && { shared: true }),
          ...(filter === "all" && { owned: true, shared: true }), // Backend should handle combining these
        };

        const response = await documentService.getDocuments(filters); // Call the getDocuments service

        if (response && response.success) {
          setDocuments(response.data); // Set the fetched documents
          setTotalDocuments(response.total); // Set total documents for pagination
          // setCurrentPage(response.pagination.currentPage); // Optional: Update currentPage based on backend response
          console.log(
            `Workspaceed ${response.count} documents (Total: ${response.total})`
          );
        } else {
          setError(response?.message || "Failed to fetch documents.");
          setDocuments([]); // Clear documents on error
          setTotalDocuments(0);
        }
      } catch (err) {
        setError(
          err.message ||
            "An unexpected error occurred while fetching documents."
        );
        setDocuments([]);
        setTotalDocuments(0);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchDocuments(); // Call the fetch function

    // Depend on filter, currentPage, itemsPerPage, and the manual refreshTrigger
  }, [filter, currentPage, itemsPerPage, refreshTrigger]);

  // --- Pagination Handlers ---
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(totalDocuments / itemsPerPage); // Calculate total pages

  // --- Filter Handler ---
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // --- Action Handlers ---
  const handleDeleteDocument = async (documentId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return; // Ask for confirmation
    }

    setRemovingDocumentId(documentId); // Set removing state for this specific document
    setError(""); // Clear general errors

    try {
      const response = await documentService.deleteDocument(documentId);

      if (response && response.success) {
        console.log("Document deleted successfully.");
        // Refresh the document list by triggering the useEffect
        setRefreshTrigger((prev) => prev + 1); // Increment refreshTrigger
        // Consider showing a small success toast/message
      } else {
        setError(response?.message || "Failed to delete document.");
      }
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred while deleting document."
      );
    } finally {
      setRemovingDocumentId(null); // Clear removing state
    }
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    setError(""); // Clear previous errors
    try {
      // documentService.downloadDocument handles the client-side download logic
      await documentService.downloadDocument(documentId, fileName);
      // Success feedback is handled internally by the download initiation
    } catch (err) {
      setError(err.message || "An error occurred during download.");
    }
  };

  // If loading, show a spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Documents...</span>
        </Spinner>
      </div>
    );
  }

  // If there's an error after loading
  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  // Render the document list
  return (
    <Card>
      {" "}
      {/* Card wrapper */}
      <Card.Body>
        <Card.Title className="mb-4">Your Documents</Card.Title> {/* Title */}
        {/* Filter and Add Button */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          {/* Filter Dropdown or Radio Buttons */}
          <Form.Group controlId="documentFilter">
            <Form.Label className="me-2 mb-0">Show:</Form.Label>
            <Form.Select
              value={filter}
              onChange={handleFilterChange}
              className="d-inline-block w-auto"
            >
              <option value="owned">Owned by Me</option>
              <option value="shared">Shared with Me</option>
              <option value="all">All Documents</option>
            </Form.Select>
          </Form.Group>

          {/* Add New Document Button */}
          <Button as={Link} to="/documents/upload" variant="success">
            Upload New Document
          </Button>
        </div>
        {/* Document Table */}
        {documents.length > 0 ? (
          <>
            {" "}
            {/* Fragment for table and pagination */}
            <Table striped bordered hover responsive>
              {" "}
              {/* Bootstrap Table styles */}
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Uploaded On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id}>
                    <td>{doc.fileName}</td>
                    <td>{doc.documentType}</td>
                    <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td>
                      {/* Action Buttons */}
                      <Button
                        as={Link}
                        to={`/documents/${doc._id}`}
                        variant="info"
                        size="sm"
                        className="me-1"
                      >
                        View
                      </Button>
                      {/*
                          Note: Edit, Delete, Share buttons are shown here for simplicity.
                          Backend authorization is crucial.
                          If the list API provides ownership/sharing flags,
                          you can conditionally render buttons here for better UX.
                          e.g. {doc.isOwner && <Button as={Link} to={`/documents/${doc._id}/edit`} variant="primary" size="sm" className="me-1">Edit</Button>}
                      */}
                      <Button
                        as={Link}
                        to={`/documents/${doc._id}/edit`}
                        variant="primary"
                        size="sm"
                        className="me-1"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          handleDeleteDocument(doc._id, doc.fileName)
                        }
                        disabled={removingDocumentId === doc._id}
                      >
                        {removingDocumentId === doc._id ? (
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                        ) : (
                          "Delete"
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="me-1"
                        onClick={() =>
                          handleDownloadDocument(doc._id, doc.fileName)
                        }
                      >
                        Download
                      </Button>
                      <Button
                        as={Link}
                        to={`/documents/${doc._id}/share`}
                        variant="secondary"
                        size="sm"
                      >
                        Share
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {/* Pagination */}
            {totalPages > 1 && ( // Only show pagination if more than one page
              <div className="d-flex justify-content-center mt-3">
                <Pagination>
                  <Pagination.First
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {/* You might render specific page numbers here */}
                  {/* Example: showing a few pages around current page */}
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Simple logic to show only pages around the current page + first/last
                    if (
                      page <= 2 ||
                      page >= totalPages - 1 ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Pagination.Item
                          key={page}
                          active={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      // Add ellipses
                      return <Pagination.Ellipsis key={`ellipsis-${page}`} />;
                    }
                    return null; // Hide other pages
                  })}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                  <Pagination.Last
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </>
        ) : (
          // Message if no documents match the criteria
          <Alert variant="info" className="text-center">
            No documents found matching the filter criteria.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}

export default DocumentList;
