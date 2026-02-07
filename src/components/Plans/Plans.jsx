import React, { useState } from "react";
import "./Plans.css";
import Button from "react-bootstrap/Button";
import { auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { useTrial } from "../../context/TrialContext";

const Plans = () => {
  const [billing, setBilling] = useState("monthly");
  const navigate = useNavigate();
  const location = useLocation();

  const { startTrial, trialActive } = useTrial();


  const requireLogin = () => {
    if (!auth.currentUser) {
      navigate("/login", {
        state: { from: location.pathname },
      });
      return false;
    }
    return true;
  };


  const handleFreeTrial = () => {
    if (!requireLogin()) return;

    startTrial();        
    navigate("/");      
  };


  const handleChoosePlan = (plan) => {
    if (!requireLogin()) return;

    navigate("/payment", {
      state: {
        billing: billing,
        plan: plan.name.toLowerCase(),
        price: plan.amount,
      },
    });
  };


  const plans = {
    monthly: [
      { name: "Basic", price: "₹199", amount: 199, duration: "/month" },
      { name: "Standard", price: "₹299", amount: 299, duration: "/month" },
      { name: "Premium", price: "₹399", amount: 399, duration: "/month" },
    ],
    yearly: [
      { name: "Basic", price: "₹1499", amount: 1499, duration: "/year" },
      { name: "Standard", price: "₹2199", amount: 2199, duration: "/year" },
      { name: "Premium", price: "₹2999", amount: 2999, duration: "/year" },
    ],
  };

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
        {plans[billing].map((plan, index) => (
          <div className="p-cards1" key={index}>
            <h1>{plan.name}</h1>

            <p>
              Enjoy an extensive library of movies and shows featuring a range of
              content, including recently released titles.
            </p>

            <div className="price">
              <h2>{plan.price}</h2>
              <span>{plan.duration}</span>
            </div>

            <div className="boot">
              <Button
                disabled={trialActive}
                className="boot1 Plans-btn trial-btn"
                onClick={handleFreeTrial}
              >
                {trialActive ? "Trial Active" : "Start Free Trial"}
              </Button>

              <Button
                className="boot2 Plans-btn"
                onClick={() => handleChoosePlan(plan)}
              >
                Choose Plan
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plans;
