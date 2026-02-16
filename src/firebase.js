// Firebase Client SDK Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
   apiKey: "AIzaSyDxPe_j4tRGHVpPIqRmwhK7gMkuo4ZEcdM",
  authDomain: "movie-1c940.firebaseapp.com",
  projectId: "movie-1c940",
  storageBucket: "movie-1c940.firebasestorage.app",
  messagingSenderId: "296945026001",
  appId: "1:296945026001:web:5c3494369b175bc9e996f0",
  measurementId: "G-H4K1F78DTQ"
};

// Debug: Log Firebase config (remove in production)
console.log('Firebase Config Check:', {
  apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
  authDomain: firebaseConfig.authDomain ? '✓ Set' : '✗ Missing',
  projectId: firebaseConfig.projectId ? '✓ Set' : '✗ Missing',
  storageBucket: firebaseConfig.storageBucket ? '✓ Set' : '✗ Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? '✓ Set' : '✗ Missing',
  appId: firebaseConfig.appId ? '✓ Set' : '✗ Missing'
});

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw error;
}

// Initialize Firebase Auth
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
// Add scopes for better user data access
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

console.log('Firebase.js API Base URL:', API_BASE_URL);



// Helper to get auth token from localStorage
const getAuthToken = () => localStorage.getItem('idToken');

// Helper to get current user from localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Helper function for Google Sign In
const signInWithGoogle = async () => {
  try {
    console.log('Starting Google Sign In popup...');
    
    // Check if auth is initialized
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google Sign In successful, user:', result.user?.email);
    
    const idToken = await result.user.getIdToken();
    console.log('ID Token obtained, length:', idToken?.length);
    
    return { user: result.user, idToken };
  } catch (error) {
    console.error('Google sign in error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked by the browser. Please allow popups for this site.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed before completing the sign-in.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for OAuth operations. Please add it to Firebase Console > Authentication > Settings > Authorized domains.');
    } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
      throw new Error('This operation is not supported in this environment. Make sure you are running on http://localhost or a secure HTTPS domain.');
    } else if (error.code === 'auth/configuration-not-found') {
      throw new Error('Firebase configuration error. Please check your Firebase project settings and ensure Google Sign-In is enabled.');
    } else if (!firebaseConfig.apiKey || !firebaseConfig.authDomain) {
      throw new Error('Firebase configuration is missing. Please check your .env file and ensure all VITE_FIREBASE_* variables are set.');
    }
    
    throw error;
  }
};


export { 
  app, 
  auth, 
  googleProvider, 
  signInWithGoogle,
  GoogleAuthProvider,
  signInWithPopup,
  API_BASE_URL,
  getAuthToken,
  getCurrentUser
};
