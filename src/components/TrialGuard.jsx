import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TrialGuard = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const trial = JSON.parse(localStorage.getItem("movieflix_trial"));

    if (trial && trial.status === "active") {
      const now = Date.now();

     
      if (now > trial.endTime) {
        navigate("/payment", {
          state: {
            plan: trial.plan,
            billing: trial.billing,
            price:
              trial.billing === "monthly"
                ? trial.plan === "basic" ? 199 : trial.plan === "standard" ? 299 : 399
                : trial.plan === "basic" ? 1499 : trial.plan === "standard" ? 2199 : 2999
          }
        });
      }
    }
  }, [navigate]);

  return children;
};

export default TrialGuard;
