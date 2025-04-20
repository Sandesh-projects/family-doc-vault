// frontend/src/services/userService.js
// This service handles API calls related to user profiles and family members
import api from './api'; // Import the configured Axios instance

const userService = {

  /**
   * Fetches the profile of the currently authenticated user.
   * @returns {Promise<object>} - A promise that resolves with the API response data ({ success, data: { ...user } }).
   * @throws {Error} - Throws an error if the API call fails.
   */
  getMe: async () => {
    try {
      const response = await api.get('/api/users/me');
      // Backend expected to return { success: true, data: { ...user } }
      return response.data;
    } catch (error) {
      console.error('UserService - Get Me Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to fetch user profile');
    }
  },

  /**
   * Updates the profile of the currently authenticated user.
   * @param {object} updateData - Object containing fields to update (e.g., { name, aadhaarNumber }).
   * @returns {Promise<object>} - A promise that resolves with the API response data ({ success, data: { ...updatedUser } }).
   * @throws {Error} - Throws an error if the API call fails.
   */
  updateMe: async (updateData) => {
    try {
      const response = await api.put('/api/users/me', updateData);
      // Backend expected to return { success: true, data: { ...updatedUser } }
      return response.data;
    } catch (error) {
      console.error('UserService - Update Me Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to update user profile');
    }
  },

   /**
   * Fetches a user profile by ID. Requires authorization (self or linked family member).
   * @param {string} userId - The ID of the user whose profile to fetch.
   * @returns {Promise<object>} - A promise that resolves with the API response data ({ success, data: { ...user } }).
   * @throws {Error} - Throws an error if the API call or authorization fails.
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      // Backend expected to return { success: true, data: { ...user } }
      return response.data;
    } catch (error) {
      console.error('UserService - Get User By ID Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || `Failed to fetch user profile with ID ${userId}`);
    }
  },


   /**
   * Links a user as a family member to the current user's profile.
   * @param {object} identifierData - Object containing identifier (email or aadhaarNumber) and identifierType.
   * @returns {Promise<object>} - A promise that resolves with the API response data ({ success, message, data: { ...updatedCurrentUser } }).
   * @throws {Error} - Throws an error if the API call fails.
   */
  addFamilyMember: async (identifierData) => {
      try {
           // identifierData should be like { identifier: 'email@example.com', identifierType: 'email' }
           // or { identifier: '123456789012', identifierType: 'aadhaarNumber' }
           const response = await api.post('/api/users/me/family', identifierData);
            // Backend expected to return { success: true, message: '...', data: { ...updatedCurrentUser } }
           return response.data;
      } catch (error) {
           console.error('UserService - Add Family Member Error:', error.response?.data || error.message);
           throw new Error(error.response?.data?.error || 'Failed to add family member');
      }
  },

   /**
   * Unlinks a user from the current user's family members list.
   * @param {string} memberId - The ID of the family member to unlink.
   * @returns {Promise<object>} - A promise that resolves with the API response data ({ success, message, data: { ...updatedCurrentUser } }).
   * @throws {Error} - Throws an error if the API call fails.
   */
  removeFamilyMember: async (memberId) => {
       try {
           const response = await api.delete(`/api/users/me/family/${memberId}`);
            // Backend expected to return { success: true, message: '...', data: { ...updatedCurrentUser } }
           return response.data;
       } catch (error) {
           console.error('UserService - Remove Family Member Error:', error.response?.data || error.message);
           throw new Error(error.response?.data?.error || 'Failed to remove family member');
       }
   }

};

export default userService;