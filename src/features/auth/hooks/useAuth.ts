import { useContext } from 'react';
import { AuthContextInstance } from '../authContext';

export const useAuth = () => {
  const context = useContext(AuthContextInstance);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
