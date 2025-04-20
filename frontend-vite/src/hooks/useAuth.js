// frontend/src/hooks/useAuth.js
// Custom hook to easily consume the Auth Context
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Import the AuthContext object

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // This check ensures useAuth is called inside a component wrapped by AuthContextProvider
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
};