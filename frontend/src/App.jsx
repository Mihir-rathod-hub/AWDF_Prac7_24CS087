import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import Home from './components/Home';
import TaskManager from './components/TaskManager';
import Contact from './components/Contact';
import NotFound from './components/NotFound';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import './App.css';

/**
 * App Component
 * Practical 7: Authentication and Middleware Pipeline
 * Configures routes, global AuthContext, theme state, and application layout.
 */
function App() {
  // Theme state: 'light' or 'dark'
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const studentProfile = {
    name: 'Mihir Rathod',
    themeColor: '#5b50e6',
    bio: "I'm a Computer Science student who enjoys problem-solving, learning how software works, and building projects. I practice data structures and algorithms through coding problems and am expanding my skills in web development, backend development, and software engineering. I'm interested in understanding the fundamentals behind the code I write, not just making things work.",
    skillList: [
      {
        category: 'Programming',
        items: ['C', 'C++', 'Java', 'Python'],
      },
      {
        category: 'Web Development',
        items: ['HTML', 'CSS', 'JavaScript', 'React basics', 'Node.js', 'Express', 'MongoDB'],
      },
      {
        category: 'Tools and Technologies',
        items: ['Git', 'GitHub', 'VS Code', 'Mongoose', 'Vite', 'JWT', 'Bcrypt'],
      },
      {
        category: 'Other',
        items: ['Data Structures and Algorithms', 'REST APIs', 'Full Stack Integration', 'Authentication'],
      },
    ],
  };

  return (
    <AuthProvider>
      <div className={`portfolio-wrapper ${theme}`}>
        <div className="portfolio-container">
          {/* Navigation Bar with Theme & Auth Controls */}
          <NavBar theme={theme} onToggleTheme={toggleTheme} />

          {/* Authentication Modal Dialog */}
          <AuthModal />

          {/* Route Definitions */}
          <main className="portfolio-content">
            <Routes>
              <Route path="/" element={<Home studentProfile={studentProfile} />} />
              <Route path="/tasks" element={<TaskManager />} />
              <Route path="/projects" element={<TaskManager />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer with student name prop */}
          <Footer name={studentProfile.name} />
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
