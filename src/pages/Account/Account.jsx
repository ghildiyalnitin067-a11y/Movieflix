import React, { useEffect, useState } from "react";
import "./Account.css";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

const TRIAL_DURATION = 7 * 24 * 60 * 60 * 1000;

const Account = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [trialLeft, setTrialLeft] = useState(null);

  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) return;


      const sub = JSON.parse(
        localStorage.getItem(`movieflix_${u.uid}_subscription`)
      );
      setSubscription(sub || null);


      const trialStart = Number(
        localStorage.getItem(`movieflix_${u.uid}_trial`)
      );

      if (!trialStart) {
        setTrialLeft(null);
        return;
      }

      const remaining =
        TRIAL_DURATION - (Date.now() - trialStart);

      setTrialLeft(remaining > 0 ? remaining : null);
    });

    return () => unsub();
  }, []);

  if (!user) return null;

  const formatTime = (ms) => {
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const m = Math.floor((ms / (1000 * 60)) % 60);
    return `${d}d ${h}h ${m}m`;
  };

  const myListCount =
    JSON.parse(
      localStorage.getItem(`movieflix_${user.uid}_mylist`)
    )?.length || 0;

  return (
    <div className="account-page">
      <h1 className="account-title">Account</h1>

      <div className="account-card">

        <section className="section">
          <div className="profile-row">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" />
            ) : (
              <div className="avatar">
                {user.email[0].toUpperCase()}
              </div>
            )}

            <div>
              <h3>{user.displayName || "User"}</h3>
              <p>{user.email}</p>
            </div>
          </div>
        </section>


        <section className="section">
          <h2>Subscription</h2>

          <div className="info-row">
            <span>Plan</span>
            <strong>
              {subscription
                ? `${subscription.plan.toUpperCase()} (${subscription.billing})`
                : trialLeft
                ? "Free Trial"
                : "None"}
            </strong>
          </div>

          {trialLeft && (
            <div className="info-row">
              <span>Trial ends in</span>
              <strong className="timer">
                {formatTime(trialLeft)}
              </strong>
            </div>
          )}

          {subscription?.endTime && (
            <div className="info-row">
              <span>Valid till</span>
              <strong>
                {new Date(subscription.endTime).toLocaleDateString(
                  "en-IN"
                )}
              </strong>
            </div>
          )}

          <button
            className="primary-btn"
            onClick={() => navigate("/subscription")}
          >
            {subscription ? "Change Plan" : "Upgrade Plan"}
          </button>
        </section>

        <section className="section">
          <h2>My List</h2>
          <div className="info-row">
            <span>Saved movies</span>
            <strong>{myListCount}</strong>
          </div>

          <Link to="/my-list" className="secondary-btn">
            View My List
          </Link>
        </section>

        <section className="section signout">
          <button
            className="signout-btn"
            onClick={() => auth.signOut()}
          >
            Sign out
          </button>
        </section>
      </div>
    </div>
  );
};

export default Account;
