import React, { useState, useEffect } from "react";
import "./Account.css";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { userAPI, planAPI, watchHistoryAPI } from "../../services/api";

import Button from "react-bootstrap/Button";

const Account = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myListCount, setMyListCount] = useState(0);
  const [watchHistory, setWatchHistory] = useState([]);
  const [activityStats, setActivityStats] = useState({
    totalWatched: 0,
    totalTime: 0,
    lastActive: null,
    favoriteGenre: 'N/A'
  });
  const [billing, setBilling] = useState("monthly");
  const navigate = useNavigate();


  // Get auth state and fetch user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserData();
        await fetchActivityData();
      } else {
        setUser(null);
        setLoading(false);
        navigate("/login", { state: { from: "/account", message: "Please login to view your account" } });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch user data from localStorage and API
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      // Try to get subscription from localStorage first
      let localSubscription = null;
      
      // Check multiple localStorage keys
      const selectedPlan = localStorage.getItem('selectedPlan');
      const userSubscription = localStorage.getItem(`movieflix_${currentUser.uid}_subscription`);
      const trialActive = localStorage.getItem('trialActive');
      const trialEndDate = localStorage.getItem('trialEndDate');

      if (selectedPlan) {
        try {
          localSubscription = JSON.parse(selectedPlan);
          console.log("Found subscription in selectedPlan:", localSubscription);
        } catch (e) {
          console.error("Error parsing selectedPlan:", e);
        }
      } else if (userSubscription) {
        try {
          localSubscription = JSON.parse(userSubscription);
          console.log("Found subscription in userSubscription:", localSubscription);
        } catch (e) {
          console.error("Error parsing userSubscription:", e);
        }
      } else if (trialActive === 'true') {
        localSubscription = {
          plan: 'trial',
          displayName: 'Free Trial',
          status: 'trial',
          trialEnd: trialEndDate,
          billingCycle: 'monthly'
        };
        console.log("Found trial subscription:", localSubscription);
      }

      // Try to get user data from API
      try {
        const response = await userAPI.getMe();
        if (response.success && response.data) {
          setUserData(response.data);
          
          // Merge API subscription with localStorage (localStorage takes priority)
          const apiSubscription = response.data.subscription;
          if (apiSubscription && !localSubscription) {
            setSubscription(apiSubscription);
          } else if (localSubscription) {
            setSubscription(localSubscription);
          }
          
          console.log("User data from API:", response.data);
        } else {
          // Use localStorage data if API fails
          setSubscription(localSubscription);
        }
      } catch (apiError) {
        console.warn("API error, using localStorage:", apiError.message);
        setSubscription(localSubscription);
      }

      // Fetch available plans
      try {
        const plansResponse = await planAPI.getPlans();
        if (plansResponse.success) {
          setPlans(plansResponse.data);
        }
      } catch (plansError) {
        console.warn("Could not fetch plans:", plansError.message);
      }

      // Get My List count from localStorage using user-specific key
      const userId = currentUser?.uid || 'anonymous';
      const myList = JSON.parse(localStorage.getItem(`movieflix_mylist_${userId}`) || "[]");
      setMyListCount(myList.length);



    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch activity data from MongoDB API
  const fetchActivityData = async () => {
    try {
      // Try to get watch history from MongoDB first
      let history = [];
      try {
        const response = await watchHistoryAPI.getWatchHistory();
        if (response.status === 'success' && response.data) {
          history = response.data.watchHistory || [];
          // Transform MongoDB format to match localStorage format for display
          history = history.map(item => ({
            id: item.movieId,
            title: item.title,
            poster: item.posterPath,
            genres: item.genres || [],
            duration: item.duration || 120,
            watchedAt: item.watchedAt,
            voteAverage: item.voteAverage
          }));
          console.log("Watch history fetched from MongoDB:", history.length, "items");
        } else {
          console.log("Watch history API returned non-success status:", response.status);
        }
      } catch (apiError) {
        console.warn("Failed to fetch watch history from MongoDB, using localStorage:", apiError);
        // Fallback to localStorage
        history = JSON.parse(localStorage.getItem("watchHistory") || "[]");
      }
      
      setWatchHistory(history);

      // Calculate stats
      const totalWatched = history.length;
      const totalTime = history.reduce((acc, item) => acc + (item.duration || 120), 0);
      
      // Get last active timestamp
      const lastActive = localStorage.getItem("lastActive");
      
      // Get favorite genre
      const genreCounts = {};
      history.forEach(item => {
        if (item.genres && Array.isArray(item.genres)) {
          item.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
          });
        }
      });
      
      const favoriteGenre = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

      setActivityStats({
        totalWatched,
        totalTime: Math.round(totalTime / 60), // Convert to hours
        lastActive: lastActive || new Date().toISOString(),
        favoriteGenre
      });

      // Update last active timestamp
      localStorage.setItem("lastActive", new Date().toISOString());
    } catch (error) {
      console.error("Error fetching activity data:", error);
    }
  };

  // Handle clear watch history
  const handleClearWatchHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your watch history?")) {
      return;
    }

    try {
      // Clear from MongoDB
      await watchHistoryAPI.clearWatchHistory();
      
      // Clear from localStorage
      localStorage.removeItem("watchHistory");
      
      // Update state
      setWatchHistory([]);
      setActivityStats(prev => ({
        ...prev,
        totalWatched: 0,
        totalTime: 0,
        favoriteGenre: 'N/A'
      }));
      
      console.log("Watch history cleared successfully");
    } catch (error) {
      console.error("Failed to clear watch history:", error);
      alert("Failed to clear watch history. Please try again.");
    }
  };


  // Get current plan details
  const getCurrentPlan = () => {
    if (!subscription) return null;
    
    // Handle trial
    if (subscription.status === 'trial' || subscription.plan === 'trial') {
      return {
        name: 'trial',
        displayName: subscription.displayName || 'Free Trial',
        price: 0,
        features: ['7 days free access', 'All movies & shows', 'HD quality', 'Watch on any device']
      };
    }

    // Find plan in available plans
    const plan = plans.find(p => 
      p.name.toLowerCase() === (subscription.plan || '').toLowerCase() ||
      p.name.toLowerCase() === (subscription.planName || '').toLowerCase()
    );

    if (plan) {
      const price = subscription.billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly;
      return {
        ...plan,
        price: price
      };
    }

    // Return subscription data if plan not found in list
    return {
      name: subscription.plan || 'Unknown',
      displayName: subscription.displayName || subscription.plan || 'Unknown Plan',
      price: subscription.price || 0,
      features: ['Access to content', 'HD streaming', 'Multiple devices']
    };
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'N/A';
    }
  };

  // Format relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000);
      const diffDays = Math.round(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays < 7) return `${diffDays} days ago`;
      return formatDate(dateString);
    } catch {
      return 'N/A';
    }
  };

  // Check if trial is active
  const isTrialActive = () => {
    if (subscription?.status !== 'trial' && subscription?.plan !== 'trial') return false;
    if (subscription?.trialEnd || subscription?.endDate) {
      const endDate = new Date(subscription.trialEnd || subscription.endDate);
      return endDate > new Date();
    }
    return false;
  };

  // Check if subscription is active
  const isSubscriptionActive = () => {
    if (!subscription) return false;
    if (subscription.status === 'active') return true;
    if (subscription.status === 'trial' && isTrialActive()) return true;
    return false;
  };

  // Get subscription status display
  const getSubscriptionStatus = () => {
    if (!subscription) return { text: 'No Active Plan', class: 'status-inactive' };
    
    if (subscription.status === 'trial' || subscription.plan === 'trial') {
      if (isTrialActive()) {
        return { text: 'Trial Active', class: 'status-active' };
      } else {
        return { text: 'Trial Expired', class: 'status-expired' };
      }
    }
    
    if (subscription.status === 'active') {
      return { text: 'Active', class: 'status-active' };
    }
    
    if (subscription.status === 'pending') {
      return { text: 'Payment Pending', class: 'status-pending' };
    }
    
    if (subscription.status === 'cancelled') {
      return { text: 'Cancelled', class: 'status-inactive' };
    }
    
    return { text: subscription.status || 'Unknown', class: 'status-inactive' };
  };

  // Get next billing date
  const getNextBillingDate = () => {
    if (!subscription) return null;
    if (subscription.endDate) return subscription.endDate;
    if (subscription.trialEnd) return subscription.trialEnd;
    return null;
  };

  // Handle plan change
  const handleChangePlan = () => {
    navigate("/", { state: { scrollToPlans: true } });
  };

  // Handle switch to a specific plan (like Choose Plan in Plans.jsx)
  const handleSwitchPlan = async (plan) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      sessionStorage.setItem('redirectAfterLogin', '/payment');
      sessionStorage.setItem('selectedPlan', JSON.stringify({
        billing: billing,
        plan: plan.name.toLowerCase(),
        displayName: plan.displayName,
        price: billing === 'monthly' ? plan.price.monthly : plan.price.yearly
      }));
      navigate("/login", {
        state: { from: "/account", message: "Please login to switch plans" },
      });
      return;
    }

    // Store plan selection locally first
    const planData = {
      plan: plan.name.toLowerCase(),
      displayName: plan.displayName,
      billingCycle: billing,
      price: billing === 'monthly' ? plan.price.monthly : plan.price.yearly,
      status: 'pending',
      selectedAt: new Date().toISOString()
    };
    
    // Save to localStorage for immediate access
    localStorage.setItem('selectedPlan', JSON.stringify(planData));
    
    // Try to update subscription in database (optional)
    try {
      await userAPI.updateSubscription({
        plan: plan.name.toLowerCase(),
        billingCycle: billing,
        status: 'pending',
        startDate: new Date().toISOString()
      });
      console.log("Subscription updated in database");
    } catch (dbError) {
      console.warn("Could not update database, continuing with local storage:", dbError.message);
    }

    // Navigate to payment page
    navigate("/payment", {
      state: {
        billing: billing,
        plan: plan.name.toLowerCase(),
        displayName: plan.displayName,
        price: billing === 'monthly' ? plan.price.monthly : plan.price.yearly,
        features: plan.features,
        quality: plan.quality,
        devices: plan.devices
      },
    });
  };


  // Handle cancel subscription
  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    try {
      // Update in API
      await userAPI.cancelSubscription();
      
      // Update localStorage
      const currentUser = auth.currentUser;
      if (currentUser) {
        localStorage.removeItem(`movieflix_${currentUser.uid}_subscription`);
        localStorage.removeItem('selectedPlan');
      }
      
      // Update state
      setSubscription(prev => prev ? { ...prev, status: 'cancelled' } : null);
      
      alert("Subscription cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      
      // Still update localStorage even if API fails
      const currentUser = auth.currentUser;
      if (currentUser) {
        localStorage.removeItem(`movieflix_${currentUser.uid}_subscription`);
        localStorage.removeItem('selectedPlan');
      }
      
      setSubscription(prev => prev ? { ...prev, status: 'cancelled' } : null);
      alert("Subscription cancelled (local)");
    }
  };

  if (loading) {
    return (
      <div className="account">
        <div className="account-loading">
          <h2>Loading your account...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentPlan = getCurrentPlan();
  const status = getSubscriptionStatus();
  const nextBilling = getNextBillingDate();

  return (
    <div className="account">
      <div className="account-container">
        {/* Header */}
        <div className="account-header">
          <h1>Account</h1>
          <p>Manage your subscription and account details</p>
        </div>

        {/* User Info Section */}
        <div className="account-section user-info">
          <h2>Profile Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Email</label>
              <span>{userData?.email || user?.email || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Display Name</label>
              <span>{userData?.displayName || user?.displayName || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Member Since</label>
              <span>{formatDate(userData?.createdAt || user?.metadata?.creationTime)}</span>
            </div>
            <div className="info-item">
              <label>Last Login</label>
              <span>{getRelativeTime(userData?.lastLoginAt)}</span>
            </div>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="account-section subscription-info">
          <h2>Subscription Details</h2>
          
          {currentPlan ? (
            <div className="subscription-card">
              <div className="subscription-header">
                <div className="plan-name">
                  <h3>{currentPlan.displayName}</h3>
                  <span className={`status-badge ${status.class}`}>
                    {status.text}
                  </span>
                </div>
                <div className="plan-price">
                  {currentPlan.price > 0 ? (
                    <>
                      <span className="price">₹{currentPlan.price}</span>
                      <span className="period">/{subscription?.billingCycle || 'month'}</span>
                    </>
                  ) : (
                    <span className="price">Free</span>
                  )}
                </div>
              </div>

              <div className="subscription-details">
                <div className="detail-item">
                  <label>Plan</label>
                  <span>{currentPlan.displayName}</span>
                </div>
                <div className="detail-item">
                  <label>Billing Cycle</label>
                  <span>{subscription?.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
                </div>
                {subscription?.startDate && (
                  <div className="detail-item">
                    <label>Start Date</label>
                    <span>{formatDate(subscription.startDate)}</span>
                  </div>
                )}
                {nextBilling && (
                  <div className="detail-item">
                    <label>{subscription?.status === 'trial' ? 'Trial Ends' : 'Next Billing Date'}</label>
                    <span>{formatDate(nextBilling)}</span>
                  </div>
                )}
              </div>

              <div className="subscription-features">
                <h4>Features</h4>
                <ul>
                  {currentPlan.features?.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
              </div>

              <div className="subscription-actions">
                <Button 
                  variant="primary" 
                  onClick={handleChangePlan}
                  className="change-plan-btn"
                >
                  Change Plan
                </Button>
                
                {isSubscriptionActive() && (
                  <Button 
                    variant="outline-danger" 
                    onClick={handleCancelSubscription}
                    className="cancel-btn"
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="no-subscription">
              <p>You don't have an active subscription.</p>
              <Button 
                variant="primary" 
                onClick={handleChangePlan}
                className="subscribe-btn"
              >
                View Plans
              </Button>
            </div>
          )}
        </div>

        {/* Activity Stats Section */}
        <div className="account-section activity-stats">
          <h2>Your Activity</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">{myListCount}</span>
              <span className="stat-label">Movies in My List</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{activityStats.totalWatched}</span>
              <span className="stat-label">Movies Watched</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{activityStats.totalTime}</span>
              <span className="stat-label">Hours Streamed</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{activityStats.favoriteGenre}</span>
              <span className="stat-label">Favorite Genre</span>
            </div>
          </div>
          
          <div className="last-active">
            <span>Last active: {getRelativeTime(activityStats.lastActive)}</span>
          </div>
        </div>

        {/* Watch History Section */}
        {watchHistory.length > 0 && (
          <div className="account-section watch-history">
            <div className="section-header">
              <h2>Recently Watched</h2>
              <button 
                className="clear-history-btn"
                onClick={handleClearWatchHistory}
                title="Clear watch history"
              >
                🗑️ Clear History
              </button>
            </div>
            <div className="history-list">
              {watchHistory.slice(0, 5).map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-poster">
                    {item.poster ? (
                      <img src={item.poster} alt={item.title} />
                    ) : (
                      <div className="placeholder-poster">🎬</div>
                    )}
                  </div>
                  <div className="history-info">
                    <h4>{item.title}</h4>
                    <p>{item.genres?.join(', ') || 'Movie'}</p>
                    <span>Watched {getRelativeTime(item.watchedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default Account;
