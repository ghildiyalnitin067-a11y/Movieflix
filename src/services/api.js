// API service for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";


// Helper to get auth token
const getAuthToken = async () => {
  try {
    const { auth } = await import("../firebase");
    const user = auth.currentUser;
    if (!user) {
      console.warn("No user logged in");
      return null;
    }
    const token = await user.getIdToken();
    console.log("Got auth token");
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Generic fetch with auth
const fetchWithAuth = async (endpoint, options = {}) => {
  console.log(`API Call: ${endpoint}`, options.method || 'GET');
  
  const token = await getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  console.log("Fetching:", url);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// User API calls
export const userAPI = {
  // Get current user profile
  getMe: () => fetchWithAuth('/users/me'),
  
  // Update current user profile
  updateMe: (data) => fetchWithAuth('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Get all users (admin only)
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/users?${queryString}`);
  },
  
  // Get user by ID (admin only)
  getUserById: (id) => fetchWithAuth(`/users/${id}`),
  
  // Update user role (admin only)
  updateUserRole: (id, role) => fetchWithAuth(`/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  
  // Delete user (admin only)
  deleteUser: (id) => fetchWithAuth(`/users/${id}`, {
    method: 'DELETE',
  }),
  
  // Search users
  searchUsers: (query, params = {}) => {
    const queryString = new URLSearchParams({ q: query, ...params }).toString();
    return fetchWithAuth(`/users/search?${queryString}`);
  },
  
  // Update subscription
  updateSubscription: (data) => fetchWithAuth('/users/subscription', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Start free trial
  startTrial: () => fetchWithAuth('/users/trial', {
    method: 'POST',
  }),
  
  // Cancel subscription
  cancelSubscription: () => fetchWithAuth('/users/cancel', {
    method: 'POST',
  }),
};

// My List API calls
export const myListAPI = {
  // Get user's my list
  getMyList: () => fetchWithAuth('/mylist'),
  
  // Add item to my list
  addToMyList: (itemData) => fetchWithAuth('/mylist', {
    method: 'POST',
    body: JSON.stringify(itemData),
  }),
  
  // Remove item from my list
  removeFromMyList: (itemId) => fetchWithAuth(`/mylist/${itemId}`, {
    method: 'DELETE',
  }),
  
  // Update item in my list (e.g., update notes, rating)
  updateMyListItem: (itemId, updates) => fetchWithAuth(`/mylist/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
// Clear entire my list
  clearMyList: () => fetchWithAuth('/mylist', {
    method: 'DELETE',
  }),
};

// Watch History API calls
export const watchHistoryAPI = {
  // Get user's watch history
  getWatchHistory: () => fetchWithAuth('/watch-history'),
  
  // Add item to watch history
  addToWatchHistory: (movieData) => fetchWithAuth('/watch-history', {
    method: 'POST',
    body: JSON.stringify(movieData),
  }),
  
  // Clear entire watch history
  clearWatchHistory: () => fetchWithAuth('/watch-history', {
    method: 'DELETE',
  }),
};


// Plan API calls

export const planAPI = {
  // Get all plans
  getPlans: async () => {
    try {
      console.log("Fetching plans from:", `${API_BASE_URL}/plans`);
      const response = await fetch(`${API_BASE_URL}/plans`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching plans:", error);
      throw error;
    }
  },
  
  // Get plan by name
  getPlanByName: (name) => fetch(`${API_BASE_URL}/plans/${name}`).then(r => r.json()),
  
  // Create plan (admin only)
  createPlan: (data) => fetchWithAuth('/plans', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Update plan (admin only)
  updatePlan: (id, data) => fetchWithAuth(`/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Delete plan (admin only)
  deletePlan: (id) => fetchWithAuth(`/plans/${id}`, {
    method: 'DELETE',
  }),
};

// Profile API calls
export const profileAPI = {
  // Get all profiles for current user
  getProfiles: () => fetchWithAuth('/profiles'),
  
  // Create new profile
  createProfile: (data) => fetchWithAuth('/profiles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // Update profile
  updateProfile: (id, data) => fetchWithAuth(`/profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // Delete profile
  deleteProfile: (id) => fetchWithAuth(`/profiles/${id}`, {
    method: 'DELETE',
  }),
  
  // Set active profile
  setActiveProfile: (id) => fetchWithAuth(`/profiles/${id}/activate`, {
    method: 'POST',
  }),
};

// Public API calls (no auth required)
export const publicAPI = {
  // Get server status
  getStatus: () => fetch(`${API_BASE_URL}/status`).then(r => r.json()),
  
  // Get health check
  getHealth: () => fetch(`${API_BASE_URL}/health`).then(r => r.json()),
  
  // Submit data
  postData: (data) => fetch(`${API_BASE_URL}/data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),
};

export default {
  userAPI,
  myListAPI,
  watchHistoryAPI,
  planAPI,
  profileAPI,
  publicAPI,
  fetchWithAuth,
};
