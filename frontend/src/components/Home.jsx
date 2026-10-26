import React from 'react';
import Header from './Header';
import About from './About';
import Skills from './Skills';
import TaskManager from './TaskManager';

/**
 * Home Component
 * Composes portfolio components: Header, About, Skills, and TaskManager.
 */
function Home({ studentProfile }) {
  return (
    <div className="home-layout">
      <Header
        name={studentProfile.name}
        themeColor={studentProfile.themeColor}
      />
      <About bio={studentProfile.bio} />
      <Skills skillList={studentProfile.skillList} />
      <TaskManager />
    </div>
  );
}

export default Home;
