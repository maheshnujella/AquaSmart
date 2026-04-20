import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// ─── Axios base URL from Vite env ─────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL || 'https://aquasmart-ilif.onrender.com';
axios.defaults.baseURL = API;
axios.defaults.withCredentials = true; // Send cookies cross-origin

export const AuthContext = createContext();

// Convenience hook
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session from localStorage ──────────────────────────────────────
  useEffect(() => {
    const storedUser = localStorage.getItem('aquasmart_user');
    const storedToken = localStorage.getItem('aquasmart_token');

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch {
        // Corrupt localStorage → clear it
        localStorage.removeItem('aquasmart_user');
        localStorage.removeItem('aquasmart_token');
      }
    }
    setLoading(false);
  }, []);

  // ── login: accepts both old { _id, name, token } and new { success, user, token } ──
  const login = (responseData) => {
    // Handle new API shape: { success: true, token, user: { _id, name, ... } }
    // Handle old API shape: { _id, name, email, phone, role, token }
    let userInfo, token;

    if (responseData.user && typeof responseData.user === 'object') {
      // New shape
      token = responseData.token;
      userInfo = responseData.user;
    } else {
      // Old / fallback shape
      const { token: t, success, ...rest } = responseData;
      token = t;
      userInfo = rest;
    }

    setUser(userInfo);
    localStorage.setItem('aquasmart_user', JSON.stringify(userInfo));

    if (token) {
      localStorage.setItem('aquasmart_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };

  // ── logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (_) {}

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