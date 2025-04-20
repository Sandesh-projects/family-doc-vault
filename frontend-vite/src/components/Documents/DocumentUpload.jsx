// // frontend/src/components/Documents/DocumentUpload.jsx
// import React, { useState, useRef } from "react"; // Import useRef for file input interaction
// import { useNavigate } from "react-router-dom"; // Use useNavigate for redirect
// import {
//   Form,
//   Button,
//   Card,
//   Alert,
//   Spinner,
//   ProgressBar,
// } from "react-bootstrap"; // Import Bootstrap components
// import documentService from "../../services/documentService"; // Import document service

// // DocumentUpload component for uploading files and metadata
// function DocumentUpload() {
//   // State for form inputs
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [documentType, setDocumentType] = useState("");
//   const [description, setDescription] = useState("");

//   // State for upload process feedback
//   const [uploading, setUploading] = useState(false); // Boolean loading state
//   const [uploadProgress, setUploadProgress] = useState(0); // Percentage for progress bar
//   const [error, setError] = useState(""); // Error state
//   const [successMessage, setSuccessMessage] = useState(""); // Success state

//   // useRef for the file input element to clear it programmatically
//   const fileInputRef = useRef(null);

//   // Use useNavigate for redirection after upload
//   const navigate = useNavigate();

//   // Handle file selection from input
//   const handleFileChange = (e) => {
//     const file = e.target.files[0]; // Get the first selected file
//     if (file) {
//       setSelectedFile(file);
//       setError(""); // Clear error if a file is selected after an error
//       setSuccessMessage(""); // Clear success message
//     } else {
//       setSelectedFile(null); // Clear selected file if selection is canceled
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault(); // Prevent default form submission

//     // --- Client-side Validation ---
//     if (!selectedFile) {
//       return setError("Please select a file to upload.");
//     }
//     if (!documentType) {
//       return setError("Please select or enter a document type.");
//     }
//     // --- End Validation ---

//     setError(""); // Clear previous errors
//     setSuccessMessage(""); // Clear previous success messages
//     setUploading(true); // Set uploading state
//     setUploadProgress(0); // Reset progress bar

//     // Create FormData object to send file and metadata
//     const formData = new FormData();
//     formData.append("document", selectedFile); // 'document' must match the field name in backend Multer config
//     formData.append("documentType", documentType);
//     formData.append("description", description); // description can be empty

//     try {
//       // Call the uploadDocument service, passing the FormData and an onUploadProgress callback
//       const response = await documentService.uploadDocument(
//         formData,
//         (progressEvent) => {
//           // Calculate upload progress percentage
//           const percentCompleted = Math.round(
//             (progressEvent.loaded * 100) / progressEvent.total
//           );
//           setUploadProgress(percentCompleted); // Update progress state
//         }
//       );

//       if (response && response.success) {
//         setSuccessMessage("Document uploaded successfully!"); // Show success message

//         // --- Reset Form ---
//         setSelectedFile(null); // Clear selected file state
//         setDocumentType(""); // Clear document type state
//         setDescription(""); // Clear description state
//         if (fileInputRef.current) {
//           // Clear the file input element visually
//           fileInputRef.current.value = "";
//         }
//         // --- End Reset Form ---

//         // Optionally, redirect to the document list after a delay
//         setTimeout(() => {
//           navigate("/documents"); // Redirect after 2 seconds
//         }, 2000);
//       } else {
//         setError(response?.message || "Failed to upload document.");
//       }
//     } catch (err) {
//       setError(
//         err.message || "An unexpected error occurred during document upload."
//       );
//     } finally {
//       setUploading(false); // Clear uploading state
//       // setUploadProgress(0); // Reset progress bar after completion/failure - decided to leave at 100% briefly
//     }
//   };

//   // Common document types (you can fetch this from an API if needed)
//   const commonDocumentTypes = [
//     "Mark Sheet",
//     "PAN Card",
//     "Passport",
//     "Driving License",
//     "Birth Certificate",
//     "Aadhaar Card",
//     "Vaccination Certificate",
//     "Medical Report",
//     "Other",
//   ];

//   return (
//     <Card>
//       {" "}
//       {/* Card wrapper */}
//       <Card.Body>
//         <Card.Title className="text-center mb-4">
//           Upload New Document
//         </Card.Title>{" "}
//         {/* Title */}
//         {/* Display feedback messages */}
//         {successMessage && <Alert variant="success">{successMessage}</Alert>}
//         {error && <Alert variant="danger">{error}</Alert>}
//         {/* Upload Form */}
//         <Form onSubmit={handleSubmit}>
//           {/* File Input */}
//           <Form.Group controlId="formFile" className="mb-3">
//             <Form.Label>Select Document File</Form.Label>
//             <Form.Control
//               type="file"
//               onChange={handleFileChange}
//               ref={fileInputRef} // Attach the ref
//               required
//               disabled={uploading} // Disable while uploading
//             />
//             {/* Display selected file name */}
//             {selectedFile && !uploading && (
//               <Form.Text className="text-muted">
//                 Selected: {selectedFile.name}
//               </Form.Text>
//             )}
//           </Form.Group>

//           {/* Document Type */}
//           <Form.Group className="mb-3" controlId="formDocumentType">
//             <Form.Label>Document Type</Form.Label>
//             {/* Use a select dropdown for common types */}
//             <Form.Select
//               value={documentType}
//               onChange={(e) => setDocumentType(e.target.value)}
//               required
//               disabled={uploading}
//             >
//               <option value="">-- Select Type --</option>
//               {commonDocumentTypes.map((type) => (
//                 <option key={type} value={type}>
//                   {type}
//                 </option>
//               ))}
//             </Form.Select>
//             {/* Or allow text input if "Other" is selected or instead of select */}
//             {/* Example: <Form.Control type="text" placeholder="e.g., Mark Sheet" value={documentType} onChange={(e) => setDocumentType(e.target.value)} required disabled={uploading} /> */}
//           </Form.Group>

//           {/* Description (Optional) */}
//           <Form.Group className="mb-3" controlId="formDescription">
//             <Form.Label>Description (Optional)</Form.Label>
//             <Form.Control
//               as="textarea" // Use textarea for multi-line input
//               rows={3}
//               placeholder="Add a brief description..."
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               disabled={uploading}
//             />
//           </Form.Group>

//           {/* Progress Bar (Show only while uploading) */}
//           {uploading && (
//             <ProgressBar
//               now={uploadProgress}
//               label={
//                 uploadProgress < 100 ? `${uploadProgress}%` : "Processing..."
//               }
//               animated={uploadProgress === 100}
//               className="mb-3"
//             />
//           )}

//           {/* Submit Button */}
//           <Button
//             variant="primary"
//             type="submit"
//             className="w-100" // Full width button
//             disabled={uploading} // Disable while uploading
//           >
//             {uploading ? (
//               <>
//                 <Spinner
//                   as="span"
//                   animation="border"
//                   size="sm"
//                   role="status"
//                   aria-hidden="true"
//                   className="me-1"
//                 />
//                 Uploading...
//               </>
//             ) : (
//               "Upload Document"
//             )}{" "}
//             {/* Change button text/icon while uploading */}
//           </Button>
//         </Form>
//       </Card.Body>
//     </Card>
//   );
// }

// export default DocumentUpload;
// frontend-vite/src/components/Documents/DocumentUpload.jsx
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  Card,
  Alert,
  Spinner,
  ProgressBar,
} from "react-bootstrap";
import documentService from "../../services/documentService";

function DocumentUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError("");
      setSuccessMessage("");
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      return setError("Please select a file to upload.");
    }
    if (!documentType) {
      return setError("Please select or enter a document type.");
    }

    // --- Add this log here ---
    console.log("Selected file before FormData:", selectedFile);
    // --- End log ---

    setError("");
    setSuccessMessage("");
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("document", selectedFile);
    formData.append("documentType", documentType);
    formData.append("description", description);

    try {
      const response = await documentService.uploadDocument(
        formData,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      );

      if (response && response.success) {
        setSuccessMessage("Document uploaded successfully!");
        console.log("Document uploaded:", response.data);
        setSelectedFile(null);
        setDocumentType("");
        setDescription("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setTimeout(() => {
          navigate("/documents");
        }, 2000);
      } else {
        setError(response?.message || "Failed to upload document.");
      }
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred during document upload."
      );
    } finally {
      setUploading(false);
    }
  };

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

  // ... rest of the component rendering code (same as before) ...
  return (
    <Card>
      {" "}
      {/* Card wrapper */}
      <Card.Body>
        <Card.Title className="text-center mb-4">
          Upload New Document
        </Card.Title>{" "}
        {/* Title */}
        {/* Display feedback messages */}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        {/* Upload Form */}
        <Form onSubmit={handleSubmit}>
          {/* File Input */}
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Select Document File</Form.Label>
            <Form.Control
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef} // Attach the ref
              required
              disabled={uploading} // Disable while uploading
            />
            {/* Display selected file name */}
            {selectedFile && !uploading && (
              <Form.Text className="text-muted">
                Selected: {selectedFile.name}
              </Form.Text>
            )}
          </Form.Group>

          {/* Document Type */}
          <Form.Group className="mb-3" controlId="formDocumentType">
            <Form.Label>Document Type</Form.Label>
            {/* Use a select dropdown for common types */}
            <Form.Select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
              disabled={uploading}
            >
              <option value="">-- Select Type --</option>
              {commonDocumentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Description (Optional) */}
          <Form.Group className="mb-3" controlId="formDescription">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea" // Use textarea for multi-line input
              rows={3}
              placeholder="Add a brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
            />
          </Form.Group>

          {/* Progress Bar (Show only while uploading) */}
          {uploading && (
            <ProgressBar
              now={uploadProgress}
              label={
                uploadProgress < 100 ? `${uploadProgress}%` : "Processing..."
              }
              animated={uploadProgress === 100}
              className="mb-3"
            />
          )}

          {/* Submit Button */}
          <Button
            variant="primary"
            type="submit"
            className="w-100" // Full width button
            disabled={uploading} // Disable while uploading
          >
            {uploading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-1"
                />
                Uploading...
              </>
            ) : (
              "Upload Document"
            )}{" "}
            {/* Change button text/icon while uploading */}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default DocumentUpload;
