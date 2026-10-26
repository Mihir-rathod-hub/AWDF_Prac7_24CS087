import React, { useState, useEffect } from 'react';
import useAuth from '../context/useAuth';

/**
 * AuthCard Component
 * Clean, professional authentication interface for login and registration.
 */
function AuthCard({
  initialMode = 'login',
  onSuccess,
  notice = null,
  isModal = false,
  onClose,
}) {
  const {
    login,
    register,
    authMode,
    setAuthMode,
    authNotice,
    setAuthNotice,
    isAuthenticated,
  } = useAuth();

  const currentMode = authMode || initialMode;
  const isLogin = currentMode === 'login';

  // Empty default state for all form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientError, setClientError] = useState('');
  const [serverError, setServerError] = useState('');

  // Reset form fields when user logs out or auth status changes
  useEffect(() => {
    if (!isAuthenticated) {
      // oxlint-disable-next-line react/set-state-in-effect
      setEmail('');
      // oxlint-disable-next-line react/set-state-in-effect
      setPassword('');
      // oxlint-disable-next-line react/set-state-in-effect
      setName('');
      // oxlint-disable-next-line react/set-state-in-effect
      setClientError('');
      // oxlint-disable-next-line react/set-state-in-effect
      setServerError('');
    }
  }, [isAuthenticated]);

  // Synchronize notice if passed as prop or context
  useEffect(() => {
    if (notice) {
      setAuthNotice(notice);
    }
  }, [notice, setAuthNotice]);

  const switchMode = (newMode) => {
    setAuthMode(newMode);
    setEmail('');
    setPassword('');
    setName('');
    setClientError('');
    setServerError('');
    setAuthNotice(null);
  };

  const validateForm = () => {
    if (!isLogin) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setClientError('Please enter your full name.');
        return false;
      }
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setClientError('Please enter your email address.');
      return false;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setClientError('Please enter a valid email address (e.g., you@example.com).');
      return false;
    }

    if (!password) {
      setClientError('Please enter your password.');
      return false;
    }

    if (!isLogin && password.length < 6) {
      setClientError('Password must be at least 6 characters long.');
      return false;
    }

    setClientError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name.trim());
      }
      setEmail('');
      setPassword('');
      setName('');
      setClientError('');
      setServerError('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setServerError(
        err.message ||
          (isLogin
            ? 'Login failed. Please check your credentials.'
            : 'Registration failed. Please try a different email.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`auth-card ${isModal ? 'auth-modal-card' : ''}`}>
      {/* Modal Close Button */}
      {isModal && onClose && (
        <button
          type="button"
          className="auth-modal-close-btn"
          onClick={onClose}
          aria-label="Close authentication modal"
        >
          ✕
        </button>
      )}

      {/* Header */}
      <div className="auth-header">
        <h3 className="auth-title">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h3>
        <p className="auth-subtitle">
          {isLogin
            ? 'Sign in to access your task dashboard'
            : 'Get started with your personal task manager'}
        </p>
      </div>

      {/* Segmented Mode Switcher */}
      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={isLogin}
          className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
          onClick={() => switchMode('login')}
        >
          Sign In
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isLogin}
          className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
          onClick={() => switchMode('register')}
        >
          Create Account
        </button>
      </div>

      {/* Session Notice Banner */}
      {authNotice && (
        <div className="auth-notice-banner" role="status">
          <svg
            className="notice-icon-svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>{authNotice}</span>
        </div>
      )}

      {/* Server Error Banner */}
      {serverError && (
        <div className="auth-error-banner" role="alert">
          <svg
            className="error-icon-svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{serverError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {!isLogin && (
          <div className="form-group">
            <label htmlFor="auth-name" className="form-label">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="auth-name"
              type="text"
              className={`form-input ${
                clientError && clientError.toLowerCase().includes('name')
                  ? 'input-error'
                  : ''
              }`}
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (clientError) setClientError('');
              }}
              disabled={isSubmitting}
              maxLength={60}
              autoComplete="name"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="auth-email" className="form-label">
            Email Address <span className="required-star">*</span>
          </label>
          <input
            id="auth-email"
            type="email"
            className={`form-input ${
              clientError && clientError.toLowerCase().includes('email')
                ? 'input-error'
                : ''
            }`}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (clientError) setClientError('');
            }}
            disabled={isSubmitting}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="auth-password" className="form-label">
            Password <span className="required-star">*</span>
            {!isLogin && (
              <span className="optional-tag"> (Min. 6 characters)</span>
            )}
          </label>
          <input
            id="auth-password"
            type="password"
            className={`form-input ${
              clientError && clientError.toLowerCase().includes('password')
                ? 'input-error'
                : ''
            }`}
            placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (clientError) setClientError('');
            }}
            disabled={isSubmitting}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            required
          />
        </div>

        {clientError && (
          <span className="form-error-text" role="alert">
            {clientError}
          </span>
        )}

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="btn-spinner-content">
              <span className="btn-mini-spinner"></span>
              {isLogin ? 'Signing In...' : 'Creating Account...'}
            </span>
          ) : isLogin ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Switcher Footer Link */}
      <div className="auth-footer-link">
        {isLogin ? (
          <span>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="auth-link-btn"
              onClick={() => switchMode('register')}
            >
              Create Account
            </button>
          </span>
        ) : (
          <span>
            Already have an account?{' '}
            <button
              type="button"
              className="auth-link-btn"
              onClick={() => switchMode('login')}
            >
              Sign In
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

export default AuthCard;
