// frontend/src/services/documentService.js
// This service handles API calls related to documents
import api from './api'; // Import the configured Axios instance

const documentService = {

  /**
   * Uploads a new document.
   * @param {FormData} formData - FormData object containing the file and metadata.
   * @returns {Promise<object>} - A promise that resolves with the API response data.
   * @throws {Error} - Throws an error if the API call fails.
   */
  // uploadDocument: async (formData) => {
  //   try {
  //     // Axios automatically sets Content-Type to 'multipart/form-data' when sending FormData
  //     const response = await api.post('/api/documents', formData);
  //     // Backend expected to return { success: true, data: { ...document } }
  //     return response.data;
  //   } catch (error) {
  //     console.error('DocumentService - Upload Error:', error.response?.data || error.message);
  //     throw new Error(error.response?.data?.error || 'Document upload failed');
  //   }
  // },
  uploadDocument: async (formData, onUploadProgress) => {
    try {
      const response = await api.post('/api/documents', formData, {
          // Pass the onUploadProgress callback to Axios config
          onUploadProgress: onUploadProgress,
          // --- Add this header explicitly as a test ---
          headers: {
              'Content-Type': 'multipart/form-data'
          }
          // --- End test header ---
      });
      // Backend expected to return { success: true, data: { ...document } }
      return response.data;
    } catch (error) {
      console.error('DocumentService - Upload Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Document upload failed');
    }
  },

  /**
   * Fetches a list of documents for the authenticated user.
   * @param {object} [filters] - Optional filter/pagination parameters (e.g., { shared: true, page: 1, limit: 10 }).
   * @returns {Promise<object>} - A promise that resolves with the API response data ({ success, count, total, pagination, data: [...] }).
   * @throws {Error} - Throws an error if the API call fails.
   */
  getDocuments: async (filters = {}) => {
    try {
      // Construct query parameters from the filters object
      const params = new URLSearchParams(filters).toString();
      const response = await api.get(`/api/documents?${params}`);
      // Backend expected to return { success: true, count, total, pagination, data: [...] }
      return response.data;
    } catch (error) {
      console.error('DocumentService - Get Documents Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch documents');
    }
  },

  /**
   * Fetches details of a single document.
   * @param {string} documentId - The ID of the document.
   * @returns {Promise<object>} - A promise that resolves with the API response data ({ success, data: { ...document } }).
   * @throws {Error} - Throws an error if the API call fails.
   */
  getDocumentDetails: async (documentId) => {
    try {
      const response = await api.get(`/api/documents/${documentId}`);
      // Backend expected to return { success: true, data: { ...document } }
      return response.data;
    } catch (error) {
      console.error('DocumentService - Get Document Details Error:', error.response?.data || error.message);
       // Specifically handle 404 if needed, or let component handle based on error message
      throw new Error(error.response?.data?.error || 'Failed to fetch document details');
    }
  },

   /**
    * Downloads a single document file.
    * @param {string} documentId - The ID of the document to download.
    * @param {string} fileName - The suggested filename for the downloaded file.
    * @returns {Promise<void>} - A promise that resolves when the download is initiated.
    * @throws {Error} - Throws an error if the API call or download process fails.
    */
    downloadDocument: async (documentId, fileName) => {
        try {
            // Set responseType to 'blob' to handle binary file data
            const response = await api.get(`/api/documents/${documentId}/download`, {
                responseType: 'blob',
            });

            // Create a blob from the response data
            const blob = new Blob([response.data], { type: response.headers['content-type'] });

            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary anchor tag to trigger the download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); // Set the desired filename
            document.body.appendChild(link); // Append to body is necessary for Firefox

            // Programmatically click the link to trigger the download
            link.click();

            // Clean up the temporary elements and URL
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log(`Download initiated for document ${documentId}`);

        } catch (error) {
            console.error('DocumentService - Download Error:', error.response?.data || error.message);
             // Backend error response might be JSON even with responseType: 'blob' if status is not 200
             let errorMessage = 'Failed to download document';
             if (error.response?.data instanceof Blob) {
                 // Try to read the blob as text to get the JSON error message
                 const text = await error.response.data.text();
                 try {
                      const errorJson = JSON.parse(text);
                      errorMessage = errorJson.error || errorMessage;
                 } catch (parseError) {
                      // Ignore parsing error, use default message
                 }
             } else if (error.response?.data?.error) {
                  errorMessage = error.response.data.error;
             } else if (error.message) {
                  errorMessage = error.message;
             }
            throw new Error(errorMessage);
        }
    },


  /**
   * Updates metadata for an existing document.
   * @param {string} documentId - The ID of the document to update.
   * @param {object} updateData - Object containing fields to update (e.g., { documentType, description }).
   * @returns {Promise<object>} - A promise that resolves with the API response data ({ success, data: { ...updatedDocument } }).
   * @throws {Error} - Throws an error if the API call fails.
   */
  updateDocument: async (documentId, updateData) => {
    try {
      const response = await api.put(`/api/documents/${documentId}`, updateData);
       // Backend expected to return { success: true, data: { ...updatedDocument } }
      return response.data;
    } catch (error) {
      console.error('DocumentService - Update Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to update document');
    }
  },

  /**
   * Deletes a document.
   * @param {string} documentId - The ID of the document to delete.
   * @returns {Promise<object>} - A promise that resolves with the API response data ({ success, message }).
   * @throws {Error} - Throws an error if the API call fails.
   */
  deleteDocument: async (documentId) => {
    try {
      const response = await api.delete(`/api/documents/${documentId}`);
       // Backend expected to return { success: true, message: '...' }
      return response.data;
    } catch (error) {
      console.error('DocumentService - Delete Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to delete document');
    }
  },

  /**
   * Shares a document with specified family members.
   * @param {string} documentId - The ID of the document to share.
   * @param {string[]} familyMemberIds - An array of User IDs (strings) to share with.
   * @returns {Promise<object>} - A promise that resolves with the API response data ({ success, data: { ...updatedDocument } }).
   * @throws {Error} - Throws an error if the API call fails.
   */
  shareDocument: async (documentId, familyMemberIds) => {
      try {
           const response = await api.post(`/api/documents/${documentId}/share`, { familyMemberIds });
            // Backend expected to return { success: true, data: { ...updatedDocument } }
           return response.data;
      } catch (error) {
           console.error('DocumentService - Share Error:', error.response?.data || error.message);
           throw new Error(error.response?.data?.error || 'Failed to share document');
      }
  }

};

export default documentService;