import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api'; // ✅ shared axios instance

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
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch {
        localStorage.removeItem('aquasmart_user');
        localStorage.removeItem('aquasmart_token');
      }
    }
    setLoading(false);
  }, []);

  // ── login: accepts both old { _id, name, token } and new { success, user, token } ──
  const login = (responseData) => {
    let userInfo, token;

    if (responseData.user && typeof responseData.user === 'object') {
      token = responseData.token;
      userInfo = responseData.user;
    } else {
      const { token: t, success, ...rest } = responseData;
      token = t;
      userInfo = rest;
    }

    setUser(userInfo);
    localStorage.setItem('aquasmart_user', JSON.stringify(userInfo));

    if (token) {
      localStorage.setItem('aquasmart_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };

  // ── logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (_) {}

    setUser(null);
    localStorage.removeItem('aquasmart_user');
    localStorage.removeItem('aquasmart_token');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, api }}>
      {children}
    </AuthContext.Provider>
  );
};