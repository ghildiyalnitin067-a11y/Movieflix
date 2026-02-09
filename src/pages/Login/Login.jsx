import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || "/";

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

  const googleLogin = async () => {
    // For now, keep the direct Firebase call for Google login
    // You can implement this in AuthContext later if needed
    try {
      setLoading(true);
      setError("");
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const { auth } = await import("../../firebase");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Navigation will happen via useEffect when user state updates
    } catch {
      setError("Google sign-in failed");
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
          onClick={googleLogin}
          disabled={loading}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
