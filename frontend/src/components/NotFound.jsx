import React from 'react';
import { Link } from 'react-router-dom';

/**
 * NotFound Component
 * Displays a friendly 404 message and a working link to return to the Home page.
 */
function NotFound() {
  return (
    <div className="not-found-card">
      <div className="not-found-code">404</div>
      <h2 className="not-found-title">Page Not Found</h2>
      <p className="not-found-desc">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/" className="not-found-link">
        &larr; Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
