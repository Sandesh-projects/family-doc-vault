// frontend-vite/src/services/api.js
// Centralized Axios instance for API calls
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  // Set the base URL for your backend API from environment variables
  // Access environment variables using import.meta.env in Vite, prefixed with VITE_
  baseURL: import.meta.env.VITE_REACT_APP_API_URL, // Corrected access method
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token for authenticated requests
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');

    // If a token exists, add it to the Authorization header
    if (token) {
      // The backend expects the header in the format 'Bearer TOKENSTRING'
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config; // Return the modified config
  },
  (error) => {
    // Do something with request error
    console.error('API Request Interceptor Error:', error);
    return Promise.reject(error); // Pass the error down the promise chain
  }
);

// You can also add a response interceptor to handle common response patterns,
// like automatically handling expired tokens (though the backend should return 401)
// or extracting data. For now, we'll keep it simple.
// api.interceptors.response.use(
//     (response) => response, // Just return the response as is
//     (error) => {
//         // Handle response errors, e.g., check for 401 and trigger logout
//         if (error.response && error.response.status === 401) {
//             console.log('Unauthorized response, potentially expired token');
//             // You could trigger logout here if needed
//             // (requires access to AuthContext or a global event system)
//         }
//         return Promise.reject(error); // Pass the error down
//     }
// );


// Export the configured Axios instance
export default api;
