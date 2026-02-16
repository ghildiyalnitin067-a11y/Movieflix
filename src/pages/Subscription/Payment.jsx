import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { userAPI } from "../../services/api";
import "./Payment.css";



const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [method, setMethod] = useState("card");
  const [processing, setProcessing] = useState(false);

  if (!state) {
    navigate("/subscription");
    return null;
  }

  const { billing, plan, price } = state;

  const handlePayment = async () => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) {
      navigate("/login");
      return;
    }


    setProcessing(true);

    const now = new Date();
    const durationMs =
      billing === "yearly"
        ? 365 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;
    
    const endDate = new Date(now.getTime() + durationMs);

    // Store in format Account.jsx expects
    const subscription = {
      plan: plan.toLowerCase(),
      displayName: state.displayName || plan.charAt(0).toUpperCase() + plan.slice(1),
      billingCycle: billing,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      status: "active",
      price: price
    };

    // Save to localStorage (primary storage for frontend)
    localStorage.setItem("selectedPlan", JSON.stringify(subscription));
    localStorage.setItem(`movieflix_${user?.uid || 'anonymous'}_subscription`, JSON.stringify(subscription));

    
    // Remove trial if exists
    localStorage.removeItem(`movieflix_${user.uid}_trial`);
    localStorage.removeItem("trialActive");
    localStorage.removeItem("trialEndDate");

    // Try to sync with backend
    try {
      await userAPI.updateSubscription({

        plan: plan.toLowerCase(),
        billingCycle: billing,
        status: 'active',
        startDate: now.toISOString(),
        endDate: endDate.toISOString()
      });
      console.log("Subscription synced with database");
    } catch (error) {
      console.warn("Could not sync with backend, using localStorage only:", error.message);
    }

    setTimeout(() => {
      setProcessing(false);
      navigate("/account");
    }, 1500);
  };


  return (
    <div className="nf-pay-page">
      <div className="nf-pay-card">

        <div className="nf-pay-header">
          <h2>Set up your payment</h2>
          <p>
            {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan •{" "}
            {billing.charAt(0).toUpperCase() + billing.slice(1)}
          </p>
        </div>

  
        <div className="nf-plan-box">
          <span>{plan.toUpperCase()}</span>
          <strong>
            ₹{price} / {billing}
          </strong>
        </div>

        <div className="nf-methods">
          <button
            className={method === "card" ? "active" : ""}
            onClick={() => setMethod("card")}
          >
            💳 Card
          </button>
          <button
            className={method === "upi" ? "active" : ""}
            onClick={() => setMethod("upi")}
          >
            📱 UPI
          </button>
          <button
            className={method === "netbanking" ? "active" : ""}
            onClick={() => setMethod("netbanking")}
          >
            🏦 Bank
          </button>
        </div>

     
        <div className="nf-inputs">
          {method === "card" && (
            <>
              <input placeholder="Card Number" />
              <div className="nf-row">
                <input placeholder="MM / YY" />
                <input placeholder="CVV" />
              </div>
            </>
          )}

          {method === "upi" && <input placeholder="yourname@upi" />}

          {method === "netbanking" && (
            <select>
              <option>Select Bank</option>
              <option>SBI</option>
              <option>HDFC</option>
              <option>ICICI</option>
            </select>
          )}
        </div>

   
        <button
          className="nf-pay-btn"
          onClick={handlePayment}
          disabled={processing}
        >
          {processing ? "Processing..." : `Pay ₹${price}`}
        </button>

        <p className="nf-footer">
          🔒 Secure payment • Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default Payment;
