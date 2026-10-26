import React from 'react';

/**
 * Footer Component
 * Props:
 *  - name: Student's name passed from App.jsx
 */
function Footer({ name }) {
  return (
    <footer className="portfolio-footer">
      <div className="footer-contact">
        <span className="footer-contact-label">Contact:</span>{' '}
        <a href="mailto:24cs087@charusat.edu.in" className="footer-email-link">
          24cs087@charusat.edu.in
        </a>
      </div>
      <p className="copyright-text">
        2026 {name}.
      </p>
    </footer>
  );
}

export default Footer;
