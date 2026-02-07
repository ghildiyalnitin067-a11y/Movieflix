import { useState, useEffect } from "react";
import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";
import "./Login.css";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

 
  const redirectPath = location.state?.from || "/";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate(redirectPath, { replace: true });
      }
    });
    return () => unsub();
  }, [navigate, redirectPath]);


  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await signInWithEmailAndPassword(auth, email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };


  const googleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate(redirectPath, { replace: true });
    } catch (err) {
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
