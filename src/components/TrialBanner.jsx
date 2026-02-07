import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TrialBanner.css";

const TRIAL_DURATION = 7 * 24 * 60 * 60 * 1000;

const TrialBanner = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(null);


  useEffect(() => {
    const trialStart = Number(
      localStorage.getItem("movieflix_trial_start")
    );

 
    if (!trialStart) {
      setTimeLeft(null);
      return;
    }

    const subscription = JSON.parse(
      localStorage.getItem("movieflix_subscription")
    );

    if (subscription?.status === "active") {
      localStorage.removeItem("movieflix_trial_start");
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const elapsed = Date.now() - trialStart;
      const remaining = TRIAL_DURATION - elapsed;

      if (remaining <= 0) {
        localStorage.removeItem("movieflix_trial_start");
        setTimeLeft(null);
        return;
      }

      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) return null;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor(
    (timeLeft % (1000 * 60 * 60)) / (1000 * 60)
  );

  return (
    <div className="trial-banner">
      <span>
        ⏳ Free trial ends in{" "}
        <strong>
          {days}d {hours}h {minutes}m
        </strong>
      </span>

      <button
        className="trial-upgrade-btn"
        onClick={() => navigate("/subscription")}
      >
        Upgrade
      </button>
    </div>
  );
};

export default TrialBanner;
