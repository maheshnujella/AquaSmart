import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

// 👉 THIS LINE IS IMPORTANT
axios.defaults.baseURL = API;

export const AuthContext = createContext();

// Convenience hook
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('aquasmart_user');
    const storedToken = localStorage.getItem('aquasmart_token');

    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

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
      await axios.post('/api/auth/logout'); // ✅ now works with baseURL
    } catch (e) {}
    
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