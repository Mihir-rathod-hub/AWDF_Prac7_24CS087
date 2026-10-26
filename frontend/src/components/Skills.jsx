import React from 'react';

/**
 * Skills Component
 * Props:
 *  - skillList: Array of skill categories, rendered dynamically via .map()
 */
function Skills({ skillList = [] }) {
  return (
    <section className="portfolio-section" id="skills">
      <div className="section-header">
        <h2 className="section-title">Skills</h2>
        <div className="section-line"></div>
      </div>
      <div className="skills-categories-grid">
        {skillList.map((group) => {
          const categoryName = group.category || 'Skills';
          const items = Array.isArray(group.items) ? group.items : [];

          return (
            <div key={categoryName} className="skill-category-card">
              <h3 className="skill-category-title">{categoryName}</h3>
              <div className="skill-tags">
                {items.map((skill) => (
                  <span key={skill} className="skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Skills;
