import React from 'react';

/**
 * TaskItem Component
 * Renders an individual task card with status toggle, edit, and delete actions.
 *
 * Props:
 *  - task: Task object (_id, title, description, completed, createdAt, priority)
 *  - onToggleStatus: (task) => void
 *  - onEdit: (task) => void
 *  - onDelete: (task) => void
 *  - isBusy: boolean (when any action on this task is processing)
 */
function TaskItem({ task, onToggleStatus, onEdit, onDelete, isBusy }) {
  const isCompleted = Boolean(task.completed);

  // Format creation timestamp
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      }).format(date);
    } catch {
      return null;
    }
  };

  const formattedDate = formatDate(task.createdAt);

  return (
    <article
      className={`task-card ${isCompleted ? 'task-completed' : 'task-pending'} ${
        isBusy ? 'task-busy' : ''
      }`}
    >
      <div className="task-card-main">
        {/* Status Toggle Checkbox */}
        <button
          type="button"
          className={`task-status-toggle ${isCompleted ? 'checked' : ''}`}
          onClick={() => onToggleStatus(task)}
          disabled={isBusy}
          title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
          aria-label={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
        >
          {isCompleted ? '✓' : ''}
        </button>

        {/* Task Details */}
        <div className="task-details">
          <div className="task-header-line">
            <h4 className={`task-title ${isCompleted ? 'completed-text' : ''}`}>
              {task.title}
            </h4>
            <span
              className={`task-status-pill ${
                isCompleted ? 'pill-completed' : 'pill-pending'
              }`}
            >
              <span className="pill-dot"></span>
              {isCompleted ? 'Completed' : 'Pending'}
            </span>
            {task.priority && (
              <span
                className={`task-priority-badge priority-${task.priority.toLowerCase()}`}
              >
                {task.priority.toLowerCase() === 'high' && 'High'}
                {task.priority.toLowerCase() === 'medium' && 'Medium'}
                {task.priority.toLowerCase() === 'low' && 'Low'}
              </span>
            )}
          </div>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          <div className="task-footer-meta">
            {formattedDate && (
              <span className="task-date">
                Created {formattedDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="task-card-actions">
        <button
          type="button"
          className="task-action-btn edit-btn"
          onClick={() => onEdit(task)}
          disabled={isBusy}
          title="Edit Task"
          aria-label={`Edit ${task.title}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
        <button
          type="button"
          className="task-action-btn delete-btn"
          onClick={() => onDelete(task)}
          disabled={isBusy}
          title="Delete Task"
          aria-label={`Delete ${task.title}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Delete
        </button>
      </div>
    </article>
  );
}

export default TaskItem;
