import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTrial } from "../context/TrialContext";

const TRIAL_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const SubscriptionGuard = ({ children }) => {
  const { user } = useAuth();
  const { trialStartTime } = useTrial();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has active trial
  const hasActiveTrial = () => {
    if (!trialStartTime) return false;
    const now = Date.now();
    const trialEnd = trialStartTime + TRIAL_DURATION;
    return now < trialEnd;
  };

  // Check if user has active subscription (from localStorage or backend)
  const hasActiveSubscription = () => {
    const subscription = localStorage.getItem('subscription');
    if (!subscription) return false;
    try {
      const subData = JSON.parse(subscription);
      return subData.status === 'active' && new Date(subData.endDate) > new Date();
    } catch {
      return false;
    }
  };

  // Check if user has selected a plan
  const hasSelectedPlan = () => {
    const selectedPlan = localStorage.getItem('selectedPlan');
    return !!selectedPlan;
  };

  const allowed = hasActiveTrial() || hasActiveSubscription() || hasSelectedPlan();

  if (!allowed) {
    return (
      <Navigate
        to="/subscription"
        replace
        state={{ blocked: true }}
      />
    );
  }

  return children;
};

export default SubscriptionGuard;
