import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";

const useRequireAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const requireAuth = () => {
    if (!auth.currentUser) {
      navigate("/login", {
        state: { from: location.pathname }
      });
      return false;
    }
    return true;
  };

  return requireAuth;
};

export default useRequireAuth;
