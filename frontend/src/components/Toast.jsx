import React, { useEffect } from 'react';

/**
 * Toast Component
 * Displays lightweight floating notification alerts for async operations.
 *
 * Props:
 *  - toast: { message: string, type: 'success' | 'error' | 'info', id: number } | null
 *  - onClose: Function to dismiss toast
 *  - duration: Timeout in milliseconds before auto-dismiss (default: 3500ms)
 */
function Toast({ toast, onClose, duration = 3500 }) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, duration, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      className={`toast-notification ${toast.type || 'info'}`}
      role="status"
      aria-live="polite"
    >
      <div className="toast-icon" aria-hidden="true">
        {isSuccess && '✓'}
        {isError && '⚠️'}
        {!isSuccess && !isError && 'ℹ️'}
      </div>
      <div className="toast-message">{toast.message}</div>
      <button
        type="button"
        className="toast-close-btn"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;
