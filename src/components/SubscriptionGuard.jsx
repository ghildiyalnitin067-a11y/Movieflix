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

  if (!sub || sub.status !== "active") return false;

  return Date.now() < sub.endTime;
};

const SubscriptionGuard = ({ children }) => {
  const user = auth.currentUser;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const uid = user.uid;

  const allowed =
    hasActiveTrial(uid) || hasActiveSubscription(uid);

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
