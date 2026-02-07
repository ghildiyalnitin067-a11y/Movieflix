import React from "react";
import "./ThankYouModal.css";

const ThankYouModal = ({ plan, billing, onContinue }) => {
  return (
    <div className="ty-overlay">
      <div className="ty-card">
        <div className="ty-icon">✔</div>

        <h2>Welcome to MovieFlix</h2>
        <p>
          Your <strong>{plan}</strong> plan (
          {billing}) is now active.
        </p>

        <button className="ty-btn" onClick={onContinue}>
          Continue Watching
        </button>
      </div>
    </div>
  );
};

export default ThankYouModal;
