// frontend/src/services/authService.js
// This service handles API calls related to authentication (login, register)
import api from './api'; // Import the configured Axios instance (we'll create api.js next)

const authService = {
  /**
   * Sends a login request to the backend.
   * @param {string} email - The user's email.
   * @param {string} password - The user's password.
   * @returns {Promise<object>} - A promise that resolves with the API response data (should contain { success, token, user }).
   * @throws {Error} - Throws an error if the API call fails.
   */
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      // Backend is expected to return { success: true, token: '...', user: { ... } } on success
      return response.data;
    } catch (error) {
      // Log the error for debugging
      console.error('AuthService - Login Error:', error.response?.data || error.message);
      // Re-throw the error so the calling component/context can handle it
      // This allows frontend components to show specific error messages from the backend
      throw new Error(error.response?.data?.error || 'Login failed'); // Throw error with backend message if available
    }
  },

  /**
   * Sends a registration request to the backend.
   * @param {object} userData - User data for registration ({ name, email, password, aadhaarNumber }).
   * @returns {Promise<object>} - A promise that resolves with the API response data (should contain { success, user } or { success, token, user }).
   * @throws {Error} - Throws an error if the API call fails.
   */
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      // Backend is expected to return { success: true, data: { ... } } or { success: true, token: '...', user: { ... } } on success
       return response.data;
    } catch (error) {
      // Log the error for debugging
      console.error('AuthService - Register Error:', error.response?.data || error.message);
       // Re-throw the error
      throw new Error(error.response?.data?.error || 'Registration failed'); // Throw error with backend message if available
    }
  },

   // No logout needed here, as logout is purely a frontend action (clearing token)
};

export default authService;