import React from 'react';

/**
 * ErrorMessage Component
 * Displays a visitor-friendly error notification with a Retry action.
 *
 * Props:
 *  - message: String describing the user-friendly error
 *  - onRetry: Callback function to re-attempt the request
 */
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-card" role="alert">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Unable to Load Repositories</h3>
      <p className="error-desc">
        {message || 'An unexpected error occurred while fetching repositories. Please try again.'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="retry-btn"
          aria-label="Retry fetching repositories"
        >
          🔄 Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
