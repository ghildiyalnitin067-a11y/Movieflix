import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  if (!auth.currentUser) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;
