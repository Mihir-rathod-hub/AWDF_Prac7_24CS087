import React from 'react';

/**
 * RepoList Component
 * Renders repository cards with name, links, description, stars, and language.
 *
 * Props:
 *  - repos: Array of GitHub repository objects
 */
function RepoList({ repos }) {
  return (
    <div className="repos-grid">
      {repos.map((repo) => (
        <article key={repo.id} className="repo-card">
          <div className="repo-card-header">
            <h3 className="repo-name">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="repo-link"
              >
                {repo.name}
              </a>
            </h3>
            <span className="repo-stars" title={`${repo.stargazers_count} stars`}>
              ⭐ {repo.stargazers_count}
            </span>
          </div>

          <p className="repo-description">
            {repo.description || 'No description provided.'}
          </p>

          <div className="repo-card-footer">
            {repo.language && (
              <span className="repo-lang-badge">
                <span className="repo-lang-dot"></span>
                {repo.language}
              </span>
            )}
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-view-link"
            >
              View on GitHub &rarr;
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

export default RepoList;
