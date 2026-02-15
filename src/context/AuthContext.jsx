import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserData = async (idToken, userObj) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.data);
        if (userObj.email !== 'ghildiyalnitin2007@gmail.com') {
          setIsAdmin(data.data?.role === 'admin');
        }
        return data.data;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedIdToken = localStorage.getItem('idToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');
      const storedUserData = localStorage.getItem('userData');

      if (storedIdToken && storedRefreshToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          if (parsedUser.email === 'ghildiyalnitin2007@gmail.com') {
            setIsAdmin(true);
          }
          
          if (storedUserData) {
            try {
              const parsedUserData = JSON.parse(storedUserData);
              setUserData(parsedUserData);
              if (parsedUserData?.role === 'admin') {
                setIsAdmin(true);
              }
            } catch (e) {
              // Ignore parse error
            }
          }
          
          const freshUserData = await fetchUserData(storedIdToken, parsedUser);
          
          if (!freshUserData) {
            await refreshTokenIfNeeded();
          }
        } catch (error) {
          localStorage.removeItem('idToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userData');
          setUser(null);
          setIsAdmin(false);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Login failed');
      }

      const data = await response.json();
      const { idToken, refreshToken, user: userObj, userData: mongoUserData } = data.data;

      localStorage.setItem('idToken', idToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userObj));

      setUser(userObj);

      if (userObj.email === 'ghildiyalnitin2007@gmail.com' || mongoUserData?.role === 'admin') {
        setIsAdmin(true);
      }

      if (mongoUserData) {
        setUserData(mongoUserData);
      } else {
        await fetchUserData(idToken, userObj);
      }

      return { user: userObj, userData: mongoUserData };
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const idToken = localStorage.getItem('idToken');
      if (idToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      setUser(null);
      setUserData(null);
      setIsAdmin(false);
    }
  };

  const refreshUserData = async () => {
    const idToken = localStorage.getItem('idToken');
    if (idToken && user) {
      return await fetchUserData(idToken, user);
    }
  };

  const getAuthToken = async () => {
    return localStorage.getItem('idToken');
  };

  const refreshTokenIfNeeded = async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('idToken', data.data.idToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        
        if (data.data.user) {
          setUser(data.data.user);
          localStorage.setItem('user', JSON.stringify(data.data.user));
        }
      } else {
        localStorage.removeItem('idToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      localStorage.removeItem('idToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userData');
      setUser(null);
      setIsAdmin(false);
    }
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

export { API_BASE_URL };
