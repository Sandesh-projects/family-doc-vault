// frontend/src/hooks/useDocuments.js
// Custom hook for fetching and managing document lists with filtering and pagination
import { useState, useEffect } from 'react';
import documentService from '../services/documentService'; // Import document service

// Hook for fetching documents with filters and pagination
// Takes initial filters (e.g., { filter: 'owned', page: 1, limit: 10 }) as an argument
const useDocuments = (initialFilters = {}) => {
  // State for document data and UI feedback
  const [documents, setDocuments] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0); // Total count for pagination
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state

  // State to manage filters and pagination params within the hook
  const [filters, setFilters] = useState(initialFilters);

  // State to manually trigger a re-fetch (e.g., after deletion)
  const [refreshTrigger, setRefreshTrigger] = useState(0);


  // Effect to fetch documents whenever filters or refreshTrigger changes
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true); // Start loading
      setError(''); // Clear previous errors
      setDocuments([]); // Clear previous documents

      try {
        // Prepare filter parameters for the API call based on the hook's internal filters state
        const apiFilters = {
          page: filters.page || 1,
          limit: filters.limit || 10,
          // Map hook filter state ('owned', 'shared', 'all') to backend query params
          ...(filters.filter === 'owned' && { owned: true }),
          ...(filters.filter === 'shared' && { shared: true }),
          ...(filters.filter === 'all' && { owned: true, shared: true }), // Backend handles combining
           // Add other potential filter properties here if needed
        };


        const response = await documentService.getDocuments(apiFilters); // Call the getDocuments service

        if (response && response.success) {
          setDocuments(response.data); // Set the fetched documents array
          setTotalDocuments(response.total); // Set total count
           // Optionally update page/limit states here if backend response confirms them
           // setFilters(prev => ({ ...prev, page: response.pagination.currentPage, limit: response.pagination.limit }));
          console.log(`Hook fetched ${response.count} documents (Total: ${response.total})`);
        } else {
          setError(response?.message || 'Failed to fetch documents.');
          setDocuments([]);
          setTotalDocuments(0);
        }
      } catch (err) {
        setError(err.message || 'An unexpected error occurred while fetching documents.');
        setDocuments([]);
        setTotalDocuments(0);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchDocuments(); // Call the fetch function

    // Depend on the internal filters state and the manual refreshTrigger
  }, [filters, refreshTrigger]);

  // Function to update filters (triggers re-fetch)
  const updateFilters = (newFilters) => {
      // Merge new filters with existing ones
      setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  // Function to trigger a manual re-fetch (e.g., after deleting a document)
  const triggerRefresh = () => {
      setRefreshTrigger(prev => prev + 1);
  };


  // Return the state and functions that components can use
  return {
    documents,
    totalDocuments,
    loading,
    error,
    filters, // Expose current filters state
    updateFilters, // Function to change filters/pagination
    triggerRefresh, // Function to force re-fetch
    // Helper for pagination values derived from filters state
    currentPage: filters.page || 1,
    itemsPerPage: filters.limit || 10,
    totalPages: Math.ceil(totalDocuments / (filters.limit || 10)), // Calculate total pages based on filters.limit
  };
};

export default useDocuments;