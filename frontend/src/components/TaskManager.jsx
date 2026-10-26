import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import useAuth from '../context/useAuth';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../services/taskService';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import ConfirmModal from './ConfirmModal';
import Toast from './Toast';
import AuthCard from './AuthCard';

/**
 * TaskManager Component
 * Complete, modern Task Management application with secure authentication and CRUD operations.
 */
function TaskManager() {
  const { isAuthenticated, user, isInitializing, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  // Form & Action states
  const [editingTask, setEditingTask] = useState(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState(null);

  // Modal & Toast states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    taskId: null,
    taskTitle: '',
    isProcessing: false,
  });
  const [toast, setToast] = useState(null);

  const formSectionRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({
      id: Date.now(),
      message,
      type,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fetch all tasks belonging to the current user
  const fetchTasks = useCallback(async (isInitial = false) => {
    if (!isInitial) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(
        err.message ||
          'Failed to load tasks from the server. Please verify your connection.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Synchronize tasks when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      // oxlint-disable-next-line react/set-state-in-effect
      fetchTasks(true);
    } else {
      // oxlint-disable-next-line react/set-state-in-effect
      setTasks([]);
      // oxlint-disable-next-line react/set-state-in-effect
      setEditingTask(null);
    }
  }, [isAuthenticated, fetchTasks]);

  // Handle Create or Update submission
  const handleFormSubmit = async (taskPayload) => {
    setIsFormSubmitting(true);
    try {
      if (editingTask) {
        // PUT /tasks/:id
        await updateTask(editingTask._id, taskPayload);
        showToast('Task updated successfully.', 'success');
        setEditingTask(null);
      } else {
        // POST /tasks
        await createTask(taskPayload);
        showToast('Task created successfully.', 'success');
      }
      // Re-fetch to guarantee consistency
      await fetchTasks(false);
    } catch (err) {
      showToast(err.message || 'Operation failed. Please try again.', 'error');
      throw err;
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Handle Edit selection
  const handleStartEdit = (task) => {
    setEditingTask(task);
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  // Handle Status Toggle (Completed <-> Pending)
  const handleToggleStatus = async (task) => {
    setBusyTaskId(task._id);
    const updatedStatus = !task.completed;

    try {
      await updateTask(task._id, { completed: updatedStatus });
      showToast(
        updatedStatus
          ? 'Task marked as completed.'
          : 'Task marked as pending.',
        'success'
      );
      await fetchTasks(false);
    } catch (err) {
      showToast(
        err.message || 'Failed to update task status. Please try again.',
        'error'
      );
    } finally {
      setBusyTaskId(null);
    }
  };

  // Open confirmation modal for deletion
  const handlePromptDelete = (task) => {
    setConfirmModal({
      isOpen: true,
      taskId: task._id,
      taskTitle: task.title,
      isProcessing: false,
    });
  };

  // Confirm Delete execution
  const handleConfirmDelete = async () => {
    if (!confirmModal.taskId) return;

    setConfirmModal((prev) => ({ ...prev, isProcessing: true }));
    try {
      await deleteTask(confirmModal.taskId);
      showToast('Task deleted successfully.', 'success');

      // If the deleted task was currently being edited, reset form
      if (editingTask && editingTask._id === confirmModal.taskId) {
        setEditingTask(null);
      }

      setConfirmModal({
        isOpen: false,
        taskId: null,
        taskTitle: '',
        isProcessing: false,
      });

      // Synchronize state
      await fetchTasks(false);
    } catch (err) {
      showToast(
        err.message || 'Failed to delete task. Please try again.',
        'error'
      );
      setConfirmModal((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const handleCloseModal = () => {
    if (!confirmModal.isProcessing) {
      setConfirmModal({
        isOpen: false,
        taskId: null,
        taskTitle: '',
        isProcessing: false,
      });
    }
  };

  // Calculate task counts
  const counts = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [tasks]);

  // Filter & Search logic
  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      // Status filter
      if (filter === 'pending' && task.completed) return false;
      if (filter === 'completed' && !task.completed) return false;

      // Text search in title or description
      if (query) {
        const matchesTitle = task.title?.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [tasks, filter, searchQuery]);

  return (
    <section className="portfolio-section" id="task-manager">
      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={hideToast} />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        taskTitle={confirmModal.taskTitle}
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseModal}
        isProcessing={confirmModal.isProcessing}
      />

      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">Task Manager</h2>
        <div className="section-line"></div>
      </div>

      <p className="task-manager-intro">
        Organize, prioritize, and track your tasks effortlessly.
      </p>

      {/* Initializing Session State */}
      {isInitializing && (
        <Spinner message="Loading session..." />
      )}

      {/* Unauthenticated View: Clean, attractive login card with no clutter */}
      {!isInitializing && !isAuthenticated && (
        <div className="unauthenticated-workspace-container">
          <AuthCard onSuccess={() => fetchTasks(true)} />
        </div>
      )}

      {/* Authenticated View: Complete Task Manager Dashboard */}
      {!isInitializing && isAuthenticated && (
        <>
          {/* User Session Bar */}
          <div className="task-session-bar">
            <div className="session-user-details">
              <div className="session-avatar" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="session-text">
                <span className="session-greeting">
                  Signed in as <strong>{user?.name || user?.email}</strong>
                </span>
                <span className="session-badge">
                  <span className="session-status-dot"></span>
                  {user?.email}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="session-logout-btn"
              title="Sign out of your session"
            >
              Sign Out
            </button>
          </div>

          {/* Stats Summary Strip */}
          <div className="task-stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-total" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{counts.total}</span>
                <span className="stat-label">Total Tasks</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-pending" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{counts.pending}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-completed" aria-hidden="true">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{counts.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          </div>

          {/* Task Creation & Editing Form */}
          <div ref={formSectionRef}>
            <TaskForm
              onSubmit={handleFormSubmit}
              editingTask={editingTask}
              onCancelEdit={handleCancelEdit}
              isSubmitting={isFormSubmitting}
            />
          </div>

          {/* Search and Filter Controls */}
          <div className="task-toolbar">
            {/* Search Input */}
            <div className="search-input-wrapper task-search-wrapper">
              <span className="search-icon" aria-hidden="true">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Search tasks by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tasks"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="clear-search-btn"
                  aria-label="Clear search text"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div
              className="task-filter-group"
              role="tablist"
              aria-label="Task status filters"
            >
              <button
                type="button"
                className={`filter-tab-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All <span className="filter-count">({counts.total})</span>
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending <span className="filter-count">({counts.pending})</span>
              </button>
              <button
                type="button"
                className={`filter-tab-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed <span className="filter-count">({counts.completed})</span>
              </button>
            </div>
          </div>

          {/* Active Filter Indicator */}
          {(searchQuery || filter !== 'all') && (
            <div className="active-filter-banner">
              <span>
                Showing <strong>{filteredTasks.length}</strong> of{' '}
                <strong>{tasks.length}</strong> tasks
                {filter !== 'all' && (
                  <>
                    {' '}
                    with status <em>&ldquo;{filter}&rdquo;</em>
                  </>
                )}
                {searchQuery && (
                  <>
                    {' '}
                    matching <em>&ldquo;{searchQuery}&rdquo;</em>
                  </>
                )}
              </span>
              <button
                type="button"
                className="clear-all-filters-btn"
                onClick={() => {
                  setFilter('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && <Spinner message="Loading tasks..." />}

          {/* Error State with Retry Button */}
          {!loading && error && (
            <ErrorMessage
              message={error}
              onRetry={() => fetchTasks(false)}
            />
          )}

          {/* Success State */}
          {!loading && !error && (
            <>
              {/* Empty State: User has no tasks yet */}
              {tasks.length === 0 && (
                <div className="empty-state-card">
                  <div className="empty-icon-svg-wrapper" aria-hidden="true">
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                  </div>
                  <h3 className="empty-title">No Tasks Yet</h3>
                  <p className="empty-desc">
                    Use the form above to create your first task.
                  </p>
                </div>
              )}

              {/* Empty State: Search/Filter matched 0 tasks */}
              {tasks.length > 0 && filteredTasks.length === 0 && (
                <div className="empty-state-card">
                  <div className="empty-icon-svg-wrapper" aria-hidden="true">
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                  <h3 className="empty-title">No Matching Tasks Found</h3>
                  <p className="empty-desc">
                    No tasks match your current filter and search keyword.
                  </p>
                  <button
                    type="button"
                    className="clear-filter-btn"
                    onClick={() => {
                      setFilter('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear Search &amp; Filters
                  </button>
                </div>
              )}

              {/* Task Items List */}
              {filteredTasks.length > 0 && (
                <div className="tasks-list-grid">
                  {filteredTasks.map((task) => (
                    <TaskItem
                      key={task._id || task.id}
                      task={task}
                      onToggleStatus={handleToggleStatus}
                      onEdit={handleStartEdit}
                      onDelete={handlePromptDelete}
                      isBusy={busyTaskId === task._id}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}

export default TaskManager;
