import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithGoogle } from "../../firebase";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  const redirectPath = location.state?.from || "/";
  
  console.log('Login.jsx API Base URL:', API_BASE_URL);


  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Starting Google Sign In...");
      
      // Use Firebase Google Sign In
      const { idToken } = await signInWithGoogle();
      console.log("Got ID token from Firebase:", idToken ? "Yes (length: " + idToken.length + ")" : "No");
      
      // Send token to backend
      console.log("Sending token to backend...");
      const response = await axios.post(`${API_BASE_URL}/auth/google-login`, {
        idToken
      });
      
      console.log("Backend response:", response.data);
      
      if (response.data.success) {
        const { idToken, refreshToken, user, userData } = response.data.data;
        
        // Store tokens
        localStorage.setItem('idToken', idToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Navigate will happen via useEffect when user state updates
        window.location.reload(); // Reload to trigger auth state change
      }
    } catch (err) {
      console.error("Google login error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || "Google login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (user) {
      // Check for stored redirect from sessionStorage (set by Plans component)
      const storedRedirect = sessionStorage.getItem('redirectAfterLogin');
      const storedPlan = sessionStorage.getItem('selectedPlan');
      
      if (storedRedirect) {
        // Clear sessionStorage
        sessionStorage.removeItem('redirectAfterLogin');
        sessionStorage.removeItem('selectedPlan');
        
        // Navigate to payment or subscription page
        if (storedRedirect === '/subscription' || storedRedirect === '/payment') {
          navigate('/payment', { 
            replace: true,
            state: storedPlan ? JSON.parse(storedPlan) : undefined
          });
        } else {
          navigate(storedRedirect, { replace: true });
        }
      } else {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, navigate, redirectPath]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await login(email, password);
      // Navigation will happen via useEffect when user state updates
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Sign In</h2>

        {error && <p className="login-error">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          disabled={loading}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          disabled={loading}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="divider">OR</div>

        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
