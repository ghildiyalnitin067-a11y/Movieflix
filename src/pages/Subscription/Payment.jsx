import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../firebase";
import "./Payment.css";

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();


  if (!state) {
    navigate("/subscription");
    return null;
  }

  const { billing, plan, price } = state;
  const [method, setMethod] = useState("card");
  const [processing, setProcessing] = useState(false);

  const handlePayment = () => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    setProcessing(true);

    const now = Date.now();

    const duration =
      billing === "yearly"
        ? 365 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;

    const subscription = {
      plan,
      billing,
      startTime: now,
      endTime: now + duration,
      status: "active",
    };

    localStorage.setItem(
      `movieflix_${user.uid}_subscription`,
      JSON.stringify(subscription)
    );


    localStorage.removeItem(`movieflix_${user.uid}_trial`);

    setTimeout(() => {
      setProcessing(false);
      navigate("/account");
    }, 1200);
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
