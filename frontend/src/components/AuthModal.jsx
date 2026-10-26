import React, { useEffect } from 'react';
import useAuth from '../context/useAuth';
import AuthCard from './AuthCard';

/**
 * AuthModal Component
 * Accessible modal dialog wrapping the AuthCard component.
 */
function AuthModal() {
  const { authModalOpen, closeAuthModal } = useAuth();

  // Close on Escape key press
  useEffect(() => {
    if (!authModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div
        className="modal-auth-container"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <AuthCard isModal={true} onClose={closeAuthModal} onSuccess={closeAuthModal} />
      </div>
    </div>
  );
}

export default AuthModal;
