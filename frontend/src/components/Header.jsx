import React from 'react';

/**
 * Header Component
 * Props:
 *  - name: Mihir Rathod
 *  - themeColor: Theme color string applied via inline styles
 */
function Header({ name, themeColor }) {
  return (
    <header className="portfolio-header" style={{ borderTopColor: themeColor }}>
      <h1 className="header-name" style={{ color: themeColor }}>
        {name}
      </h1>
      <p className="header-subtitle">
        Computer Science Student | Aspiring Software Developer
      </p>
    </header>
  );
}

export default Header;
