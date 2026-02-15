import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Check authentication using localStorage (backend-only auth)
  const user = localStorage.getItem('user');
  const idToken = localStorage.getItem('idToken');

  if (!user || !idToken) {
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
