import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService, { getToken, removeToken } from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Manages global authentication state, token validation on load,
 * session recovery via /auth/me, and reactive 401 expiration handling.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getToken());
  const [isInitializing, setIsInitializing] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authNotice, setAuthNotice] = useState(null);

  // Validate existing stored token on app initialization
  const validateSession = useCallback(async () => {
    const existingToken = getToken();
    if (!existingToken) {
      setUser(null);
      setTokenState(null);
      setIsInitializing(false);
      return;
    }

    try {
      const userData = await authService.getMe(existingToken);
      setUser(userData);
      setTokenState(existingToken);
    } catch {
      // Token is invalid, expired, or backend unreachable
      removeToken();
      setUser(null);
      setTokenState(null);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    validateSession();
  }, [validateSession]);

  // Handle global 401 Unauthorized events from any API request
  useEffect(() => {
    const handleUnauthorized = (event) => {
      setUser(null);
      setTokenState(null);
      setAuthNotice(
        event?.detail?.message ||
          'Your session has expired or is unauthorized. Please log in again.'
      );
      setAuthMode('login');
      setAuthModalOpen(true);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    const result = await authService.login({ email, password });
    if (result.token) {
      setTokenState(result.token);
      setUser(result.user);
      setAuthNotice(null);
      setAuthModalOpen(false);
    }
    return result;
  };

  // Register handler
  const register = async (email, password, name) => {
    const result = await authService.register({ email, password, name });
    if (result.token) {
      setTokenState(result.token);
      setUser(result.user);
      setAuthNotice(null);
      setAuthModalOpen(false);
    }
    return result;
  };

  // Logout handler
  const logout = () => {
    authService.logout();
    setUser(null);
    setTokenState(null);
    setAuthNotice(null);
  };

  const openLogin = (notice = null) => {
    if (notice) setAuthNotice(notice);
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthNotice(null);
    setAuthMode('register');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthNotice(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isInitializing,
    authModalOpen,
    authMode,
    authNotice,
    setAuthMode,
    setAuthNotice,
    login,
    register,
    logout,
    openLogin,
    openRegister,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
