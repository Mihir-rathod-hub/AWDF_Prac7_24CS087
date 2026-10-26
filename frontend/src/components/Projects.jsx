import React, { useState, useEffect, useCallback } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import RepoList from './RepoList';

const GITHUB_API_URL =
  'https://api.github.com/users/Mihir-rathod-hub/repos?per_page=100&sort=updated';

/**
 * Projects Component
 * Practical 3: API Integration and Data Rendering
 * Fetches public repositories from GitHub REST API with search filtering,
 * loading indicator, error handling, and retry capability.
 */
function Projects() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Reusable fetch function called on mount and on retry
  const fetchRepos = useCallback(async (isInitialMount = false) => {
    if (!isInitialMount) {
      setLoading(true);
      setError(null);
    }

    try {
      const response = await fetch(GITHUB_API_URL);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            'GitHub API rate limit reached. Please wait a few moments and try again.'
          );
        } else if (response.status === 404) {
          throw new Error('GitHub profile or repositories not found.');
        } else {
          throw new Error(
            `Unable to retrieve repositories (Status: ${response.status}).`
          );
        }
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Received unexpected data format from the GitHub API.');
      }

      setRepos(data);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError(
          'Network connection error. Please verify your internet connection and try again.'
        );
      } else {
        setError(err.message || 'Failed to load repositories. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch repositories once on component mount using an empty dependency array
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    fetchRepos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side case-insensitive repository filtering
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(trimmedQuery)
  );

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleRetry = () => {
    fetchRepos(false);
  };

  return (
    <section className="portfolio-section" id="projects">
      <div className="section-header">
        <h2 className="section-title">GitHub Repositories</h2>
        <div className="section-line"></div>
      </div>

      <p className="projects-intro">
        Browse open-source projects, laboratory code, and software repositories
        fetched directly from my GitHub profile.
      </p>

      {/* Loading State */}
      {loading && <Spinner message="Fetching repositories from GitHub..." />}

      {/* Error State with Retry Button */}
      {!loading && error && (
        <ErrorMessage message={error} onRetry={handleRetry} />
      )}

      {/* Success State */}
      {!loading && !error && (
        <>
          {/* Search and Filter Controls */}
          {repos.length > 0 && (
            <div className="repo-search-bar">
              <div className="search-input-wrapper">
                <span className="search-icon" aria-hidden="true">
                  🔍
                </span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search repositories by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search repositories by name"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="clear-search-btn"
                    aria-label="Clear search query"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="repo-count-badge">
                {trimmedQuery ? (
                  <span>
                    Showing <strong>{filteredRepos.length}</strong> of{' '}
                    <strong>{repos.length}</strong> repositories
                  </span>
                ) : (
                  <span>
                    Total: <strong>{repos.length}</strong> public repositories
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Empty State: Profile has no public repositories */}
          {repos.length === 0 && (
            <div className="empty-state-card">
              <div className="empty-icon">📁</div>
              <h3 className="empty-title">No Repositories Found</h3>
              <p className="empty-desc">
                There are currently no public repositories listed on this GitHub
                account.
              </p>
            </div>
          )}

          {/* Empty State: Search query matches 0 repositories */}
          {repos.length > 0 && filteredRepos.length === 0 && (
            <div className="empty-state-card">
              <div className="empty-icon">🔎</div>
              <h3 className="empty-title">No Matching Repositories</h3>
              <p className="empty-desc">
                No repositories match the name &ldquo;
                <strong>{searchQuery}</strong>&rdquo;. Try searching with a
                different keyword.
              </p>
              <button
                type="button"
                onClick={handleClearSearch}
                className="clear-filter-btn"
              >
                Clear Search Filter
              </button>
            </div>
          )}

          {/* Repository List Grid */}
          {filteredRepos.length > 0 && <RepoList repos={filteredRepos} />}
        </>
      )}
    </section>
  );
}

export default Projects;
