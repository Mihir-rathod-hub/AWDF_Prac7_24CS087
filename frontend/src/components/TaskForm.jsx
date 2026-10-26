import React, { useState, useEffect } from 'react';

/**
 * TaskForm Component
 * Handles creating new tasks and editing existing tasks.
 *
 * Props:
 *  - onSubmit: (taskData) => Promise<void>
 *  - editingTask: Task object when editing, or null when creating
 *  - onCancelEdit: () => void
 *  - isSubmitting: boolean
 */
function TaskForm({ onSubmit, editingTask, onCancelEdit, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [validationError, setValidationError] = useState('');

  // Synchronize form inputs when editingTask changes
  useEffect(() => {
    if (editingTask) {
      // oxlint-disable-next-line react/set-state-in-effect
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setPriority(editingTask.priority || 'medium');
      setValidationError('');
    } else {
      // oxlint-disable-next-line react/set-state-in-effect
      setTitle('');
      setDescription('');
      setPriority('medium');
      setValidationError('');
    }
  }, [editingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setValidationError('Please enter a task title.');
      return;
    }

    setValidationError('');

    const taskPayload = {
      title: trimmedTitle,
      description: description.trim(),
      priority,
    };

    if (editingTask) {
      taskPayload.completed = editingTask.completed;
    }

    try {
      await onSubmit(taskPayload);
      if (!editingTask) {
        // Clear fields on successful creation
        setTitle('');
        setDescription('');
        setPriority('medium');
      }
    } catch (err) {
      setValidationError(err.message || 'Failed to save task.');
    }
  };

  return (
    <div className="task-form-card">
      <div className="task-form-header">
        <div className="task-form-title-group">
          <span className="task-form-badge">
            {editingTask ? 'Edit Task' : 'New Task'}
          </span>
          <h3 className="task-form-title">
            {editingTask ? 'Update Task Details' : 'Add a New Task'}
          </h3>
        </div>
        {editingTask && (
          <button
            type="button"
            className="task-cancel-edit-btn"
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="task-title" className="form-label">
            Task Title <span className="required-star">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className={`form-input ${validationError ? 'input-error' : ''}`}
            placeholder="e.g., Prepare quarterly roadmap review..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationError) setValidationError('');
            }}
            disabled={isSubmitting}
            maxLength={120}
          />
          {validationError && (
            <span className="form-error-text" role="alert">
              {validationError}
            </span>
          )}
        </div>

        <div className="form-row-2col">
          <div className="form-group">
            <label htmlFor="task-priority" className="form-label">
              Priority
            </label>
            <select
              id="task-priority"
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-desc" className="form-label">
              Description <span className="optional-tag">(Optional)</span>
            </label>
            <textarea
              id="task-desc"
              className="form-textarea"
              placeholder="Add any additional context, specifications, or notes..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              maxLength={500}
            />
            <div className="char-counter">
              {description.length} / 500 characters
            </div>
          </div>
        </div>

        <div className="task-form-actions">
          {editingTask && (
            <button
              type="button"
              className="task-btn task-btn-secondary"
              onClick={onCancelEdit}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="task-btn task-btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="btn-spinner-content">
                <span className="btn-mini-spinner"></span>
                {editingTask ? 'Saving Changes...' : 'Creating Task...'}
              </span>
            ) : editingTask ? (
              'Update Task'
            ) : (
              'Add Task'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;
