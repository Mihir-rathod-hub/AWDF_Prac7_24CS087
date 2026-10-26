import React from 'react';

/**
 * Spinner Component
 * Accessible loading indicator with theme-compatible styling
 */
function Spinner({ message = 'Loading repositories...' }) {
  return (
    <div className="spinner-wrapper" role="status" aria-live="polite">
      <div className="spinner-circle"></div>
      <p className="spinner-text">{message}</p>
    </div>
  );
}

export default Spinner;
