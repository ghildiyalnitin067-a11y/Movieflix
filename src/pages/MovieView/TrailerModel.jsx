import React, { useEffect } from "react";
import "./TrailerModel.css";

const TrailerModal = ({ videoKey, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div className="tm-overlay" onClick={onClose}>
      <div
        className="tm-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="tm-close"
          onClick={onClose}
          aria-label="Close trailer"
        >
          ✕
        </button>

        <iframe
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
          title="Movie Trailer"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default TrailerModal;
