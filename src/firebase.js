// Firebase Client SDK Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

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
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (error) {
    console.error('Google sign in error:', error);
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
