import { createContext, useState } from 'react';
import axios from 'axios';

// Tell Vite's linter to ignore the Fast Refresh rule for this export
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state DIRECTLY from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('bellcorp_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [loading, setLoading] = useState(false);

  // Login Function
  const login = async (email, password) => {
    setLoading(true); // Tell the app we are loading
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      setUser(response.data);
      localStorage.setItem('bellcorp_user', JSON.stringify(response.data));
      setLoading(false); // Stop loading on success
      return { success: true };
    } catch (error) {
      setLoading(false); // Stop loading on error
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  // Register Function
  const register = async (name, email, password) => {
    setLoading(true); // Tell the app we are loading
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      setUser(response.data);
      localStorage.setItem('bellcorp_user', JSON.stringify(response.data));
      setLoading(false); // Stop loading on success
      return { success: true };
    } catch (error) {
      setLoading(false); // Stop loading on error
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  // Logout Function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('bellcorp_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};