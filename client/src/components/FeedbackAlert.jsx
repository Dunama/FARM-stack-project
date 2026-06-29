import React from 'react';

function FeedbackAlert({ type, message, onClose }) {
  if (!message) return null;

  return (
    <div className={`feedback-alert feedback-alert--${type}`} role="alert">
      <span>{message}</span>
      <button
        className="feedback-alert__close"
        onClick={onClose}
        aria-label="Dismiss"
      >
        Close
      </button>
    </div>
  );
}

export default FeedbackAlert;
