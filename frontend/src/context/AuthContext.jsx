import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

// Convenience hook
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start true so app waits for init check

  useEffect(() => {
    // On app load, check if a token exists in localStorage and validate it
    const storedUser = localStorage.getItem('aquasmart_user');
    const storedToken = localStorage.getItem('aquasmart_token');

    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Set default Authorization header for all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  // Called after successful login or register
  const login = (userData) => {
    const { token, ...userInfo } = userData;
    setUser(userInfo);
    localStorage.setItem('aquasmart_user', JSON.stringify(userInfo));
    if (token) {
      localStorage.setItem('aquasmart_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (e) {
      // ignore errors on logout
    }
    setUser(null);
    localStorage.removeItem('aquasmart_user');
    localStorage.removeItem('aquasmart_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
