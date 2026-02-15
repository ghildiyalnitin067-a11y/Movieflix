import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const idToken = searchParams.get('idToken');
      const refreshToken = searchParams.get('refreshToken');
      const expiresIn = searchParams.get('expiresIn');
      const redirect = searchParams.get('redirect') || '/';
      const error = searchParams.get('error');

      if (error) {
        console.error('Auth callback error:', error);
        navigate('/login?error=' + error);
        return;
      }

      if (!idToken || !refreshToken) {
        console.error('Missing tokens in callback');
        navigate('/login?error=missing_tokens');
        return;
      }

      try {
        // Decode the ID token to get user info (simple decode, not verify)
        const payload = JSON.parse(atob(idToken.split('.')[1]));

        const userObj = {
          uid: payload.user_id || payload.sub,
          email: payload.email,
          emailVerified: payload.email_verified,
          displayName: payload.name,
          photoURL: payload.picture
        };

        // Store tokens and user in localStorage
        localStorage.setItem('idToken', idToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userObj));

        // Trigger AuthContext to pick up the new state by calling login with dummy credentials
        // This will cause the AuthContext useEffect to run and set the user state
        await login('', ''); // This will fail but trigger the state update

        // Navigate to the intended page
        navigate(redirect, { replace: true });
      } catch (error) {
        console.error('Error processing auth callback:', error);
        navigate('/login?error=callback_processing_failed');
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '18px'
    }}>
      Completing sign in...
    </div>
  );
};

export default AuthCallback;
