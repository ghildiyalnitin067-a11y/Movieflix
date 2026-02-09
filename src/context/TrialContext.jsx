import React, { createContext, useContext, useState } from "react";

const TRIAL_DURATION = 7 * 24 * 60 * 60 * 1000;
const STORAGE_KEY = "movieflix_trial_start";

const TrialContext = createContext(null);

export const TrialProvider = ({ children }) => {
  const [trialStartTime, setTrialStartTime] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Number(saved) : null;
  });

  const startTrial = () => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEY, now.toString());
    setTrialStartTime(now);
  };

  const endTrial = () => {
    localStorage.removeItem(STORAGE_KEY);
    setTrialStartTime(null);
  };

  return (
    <TrialContext.Provider
      value={{ trialStartTime, startTrial, endTrial }}
    >
      {children}
    </TrialContext.Provider>
  );
};

export const useTrial = () => {
  const ctx = useContext(TrialContext);
  if (!ctx) {
    throw new Error("useTrial must be used inside TrialProvider");
  }
  return ctx;
};
