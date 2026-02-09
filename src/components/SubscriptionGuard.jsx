import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

const TRIAL_DURATION = 7 * 24 * 60 * 60 * 1000;

const hasActiveTrial = (uid) => {
  const start = Number(
    localStorage.getItem(`movieflix_${uid}_trial`)
  );
  if (!start) return false;

  return Date.now() - start < TRIAL_DURATION;
};

const hasActiveSubscription = (uid) => {
  const sub = JSON.parse(
    localStorage.getItem(`movieflix_${uid}_subscription`)
  );

  if (!sub) return false;
  
  // Allow active, pending, or trial statuses
  if (sub.status === "active" || sub.status === "pending" || sub.status === "trial") {
    return true;
  }

  return Date.now() < sub.endTime;
};

const hasSelectedPlan = (uid) => {
  // Check if user has selected a plan (stored from Plans component)
  const selectedPlan = localStorage.getItem('selectedPlan');
  if (selectedPlan) {
    const plan = JSON.parse(selectedPlan);
    // If plan was selected within last 30 days, allow access
    if (plan.selectedAt) {
      const selectedTime = new Date(plan.selectedAt).getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      return Date.now() - selectedTime < thirtyDays;
    }
    return true;
  }
  return false;
};


const SubscriptionGuard = ({ children }) => {
  const user = auth.currentUser;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const uid = user.uid;

  const allowed =
    hasActiveTrial(uid) || hasActiveSubscription(uid) || hasSelectedPlan(uid);

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
