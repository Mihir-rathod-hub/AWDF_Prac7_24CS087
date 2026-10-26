import React from 'react';

/**
 * About Component
 * Props:
 *  - bio: Student introductory biography string
 */
function About({ bio }) {
  return (
    <section className="portfolio-section" id="about">
      <div className="section-header">
        <h2 className="section-title">About Me</h2>
        <div className="section-line"></div>
      </div>
      <div className="about-card">
        <p className="about-bio">{bio}</p>
      </div>
    </section>
  );
}

export default About;
