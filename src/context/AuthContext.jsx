import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut,
  getIdToken
} from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext(null);

// API base URL - change this to your backend URL
const API_BASE_URL = "http://localhost:5001/api";


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user data from backend
  const fetchUserData = async (firebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();

      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.data);
        // Only set isAdmin from backend if not permanent admin
        if (firebaseUser.email !== 'ghildiyalnitin2007@gmail.com') {
          setIsAdmin(data.data?.role === 'admin');
        }
        return data.data;
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch user data:', errorText);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Check if user is permanent admin
        if (firebaseUser.email === 'ghildiyalnitin2007@gmail.com') {
          setIsAdmin(true);
        }
        await fetchUserData(firebaseUser);
      } else {
        setUserData(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Set admin status immediately for permanent admin
    if (userCredential.user.email === 'ghildiyalnitin2007@gmail.com') {
      setIsAdmin(true);
    }

    const userData = await fetchUserData(userCredential.user);
    return { user: userCredential.user, userData };
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
    setIsAdmin(false);
  };

  const refreshUserData = async () => {
    if (user) {
      return await fetchUserData(user);
    }
  };

  const getAuthToken = async () => {
    if (user) {
      return await user.getIdToken();
    }
    return null;
  };

  const value = {
    user,
    userData,
    loading,
    isAdmin,
    login,
    logout,
    refreshUserData,
    getAuthToken,
    fetchUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Export API base URL for use in other services
export { API_BASE_URL };
