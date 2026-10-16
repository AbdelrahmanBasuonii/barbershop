import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('t') || localStorage.getItem('at');
    if (!token) {
      setLoading(false);
      return;
    }
    api('me', { token })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('t');
        localStorage.removeItem('at');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials, requiredRole) {
    const result = await api('login', { method: 'POST', body: credentials, token: '' });
    if (requiredRole && result.user.role !== requiredRole) throw new Error('الحساب ده مش حساب أدمن');
    const storageKey = result.user.role === 'admin' ? 'at' : 't';
    localStorage.removeItem(storageKey === 'at' ? 't' : 'at');
    localStorage.setItem(storageKey, result.token);
    setUser(result.user);
    return result.user;
  }

  async function register(details) {
    const result = await api('register', { method: 'POST', body: details, token: '' });
    localStorage.removeItem('at');
    localStorage.setItem('t', result.token);
    setUser(result.user);
    return result.user;
  }

  function logout() {
    localStorage.removeItem('t');
    localStorage.removeItem('at');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
