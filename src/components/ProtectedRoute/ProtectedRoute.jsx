import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  // IMPORTANT: Wait for auth to finish loading before making any decisions
  // This prevents redirecting to login on page refresh while tokens are being validated
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#141414',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Only redirect after loading is complete and we know for sure there's no user
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Admin required but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // All checks passed - render the protected component
  return children;
};

export default ProtectedRoute;
