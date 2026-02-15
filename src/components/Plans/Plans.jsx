import React, { useState, useEffect } from "react";
import "./Plans.css";
import Button from "react-bootstrap/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { useTrial } from "../../context/TrialContext";
import { planAPI, userAPI } from "../../services/api";


const Plans = () => {
  const [billing, setBilling] = useState("monthly");
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingTrial, setProcessingTrial] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { startTrial, trialActive } = useTrial();

  // Track auth state
  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      setCurrentUser(userStr ? JSON.parse(userStr) : null);
    };
    
    checkAuth();
    
    // Listen for storage changes
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);




  // Fetch plans from database
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await planAPI.getPlans();
        if (response.success) {
          setPlans(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const requireLogin = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {

      // Store the intended action in sessionStorage
      sessionStorage.setItem('redirectAfterLogin', '/subscription');
      sessionStorage.setItem('selectedPlan', JSON.stringify({
        billing: billing,
        from: location.pathname
      }));
      navigate("/login", {
        state: { from: location.pathname, message: "Please login to select a plan" },
      });
      return false;
    }
    return true;
  };


  const handleFreeTrial = async () => {
    if (!requireLogin()) return;
    if (processingTrial) return;

    setProcessingTrial(true);
    try {
      console.log("Starting free trial...");
      // Start trial in database
      const result = await userAPI.startTrial();
      console.log("Trial started:", result);
      startTrial();        
      alert("Free trial started successfully!");
      navigate("/");      
    } catch (error) {
      console.error("Failed to start trial:", error);
      // If user not found in database, still allow local trial
      if (error.message && error.message.includes("User not found")) {
        console.log("User not in database, starting local trial only");
        startTrial();
        alert("Free trial started (local mode)!");
        navigate("/");
      } else {
        alert(error.message || "Failed to start trial. Please try again.");
      }
    } finally {
      setProcessingTrial(false);
    }
  };



  const handleChoosePlan = async (plan) => {
    if (!requireLogin()) return;
    if (processingPlan) return;

    setProcessingPlan(plan.name);
    try {
      console.log("Selecting plan:", plan.name);
      
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
    } catch (error) {
      console.error("Failed to select plan:", error);
      alert(error.message || "Failed to select plan. Please try again.");
    } finally {
      setProcessingPlan(null);
    }
  };



  if (loading) {
    return (
      <div className="plans">
        <div className="plans-header">
          <h1>Loading plans...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="plans">
      
      <div className="plans-header">
        <div className="title-p">
          <h1>Choose the plan that's right for you</h1>
          <p>
            Join Movieflix and select from our flexible subscription options
            tailored to suit your viewing preferences.
          </p>
        </div>

        <div className="planss-btn">
          <span className={billing === "monthly" ? "active" : ""}>
            Monthly
          </span>

          <label className="switch">
            <input
              type="checkbox"
              checked={billing === "yearly"}
              onChange={() =>
                setBilling(billing === "monthly" ? "yearly" : "monthly")
              }
            />
            <span className="slider"></span>
          </label>

          <span className={billing === "yearly" ? "active" : ""}>
            Yearly
          </span>
        </div>
      </div>

      <div className="plan-cards">
        {plans.map((plan, index) => (
          <div className="p-cards1" key={index}>
            <h1>{plan.displayName}</h1>

            <p>
              Enjoy an extensive library of movies and shows featuring a range of
              content, including recently released titles.
            </p>

            <div className="price">
              <h2>₹{billing === 'monthly' ? plan.price.monthly : plan.price.yearly}</h2>
              <span>/{billing === 'monthly' ? 'month' : 'year'}</span>
            </div>

            <div className="features-list">
              <ul>
                {plan.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
            </div>

            <div className="plan-meta">
              <span>{plan.quality} Quality ({plan.resolution})</span>
              <span>{plan.devices} Device{plan.devices > 1 ? 's' : ''}</span>
            </div>

            <div className="boot">
              <Button
                disabled={trialActive || processingTrial}
                className="boot1 Plans-btn trial-btn"
                onClick={handleFreeTrial}
              >
                {processingTrial ? "Processing..." : trialActive ? "Trial Active" : "Start Free Trial"}
              </Button>

              <Button
                disabled={processingPlan === plan.name}
                className="boot2 Plans-btn"
                onClick={() => handleChoosePlan(plan)}
              >
                {processingPlan === plan.name ? "Processing..." : "Choose Plan"}
              </Button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;
