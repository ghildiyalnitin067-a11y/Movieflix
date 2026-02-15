const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const getAuthToken = async () => {
  try {
    return localStorage.getItem('idToken');
  } catch (error) {
    return null;
  }
};

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const userAPI = {
  getMe: () => fetchWithAuth('/users/me'),
  
  updateMe: (data) => fetchWithAuth('/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/users?${queryString}`);
  },
  
  getUserById: (id) => fetchWithAuth(`/users/${id}`),
  
  updateUserRole: (id, role) => fetchWithAuth(`/users/${id}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  }),
  
  deleteUser: (id) => fetchWithAuth(`/users/${id}`, {
    method: 'DELETE',
  }),
  
  searchUsers: (query, params = {}) => {
    const queryString = new URLSearchParams({ q: query, ...params }).toString();
    return fetchWithAuth(`/users/search?${queryString}`);
  },
  
  updateSubscription: (data) => fetchWithAuth('/users/subscription', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  startTrial: () => fetchWithAuth('/users/trial', {
    method: 'POST',
  }),
  
  cancelSubscription: () => fetchWithAuth('/users/cancel', {
    method: 'POST',
  }),
};

export const myListAPI = {
  getMyList: () => fetchWithAuth('/mylist'),
  
  addToMyList: (itemData) => fetchWithAuth('/mylist', {
    method: 'POST',
    body: JSON.stringify(itemData),
  }),
  
  removeFromMyList: (itemId) => fetchWithAuth(`/mylist/${itemId}`, {
    method: 'DELETE',
  }),
  
  updateMyListItem: (itemId, updates) => fetchWithAuth(`/mylist/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  clearMyList: () => fetchWithAuth('/mylist', {
    method: 'DELETE',
  }),
};

export const watchHistoryAPI = {
  getWatchHistory: () => fetchWithAuth('/watch-history'),
  
  addToWatchHistory: (movieData) => fetchWithAuth('/watch-history', {
    method: 'POST',
    body: JSON.stringify(movieData),
  }),
  
  clearWatchHistory: () => fetchWithAuth('/watch-history', {
    method: 'DELETE',
  }),
};

export const planAPI = {
  getPlans: async () => {
    const response = await fetch(`${API_BASE_URL}/plans`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },
  
  getPlanByName: (name) => fetch(`${API_BASE_URL}/plans/${name}`).then(r => r.json()),
  
  createPlan: (data) => fetchWithAuth('/plans', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updatePlan: (id, data) => fetchWithAuth(`/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deletePlan: (id) => fetchWithAuth(`/plans/${id}`, {
    method: 'DELETE',
  }),
};

export const profileAPI = {
  getProfiles: () => fetchWithAuth('/profiles'),
  
  createProfile: (data) => fetchWithAuth('/profiles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateProfile: (id, data) => fetchWithAuth(`/profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteProfile: (id) => fetchWithAuth(`/profiles/${id}`, {
    method: 'DELETE',
  }),
  
  setActiveProfile: (id) => fetchWithAuth(`/profiles/${id}/activate`, {
    method: 'POST',
  }),
};

export const publicAPI = {
  getStatus: () => fetch(`${API_BASE_URL}/status`).then(r => r.json()),
  
  getHealth: () => fetch(`${API_BASE_URL}/health`).then(r => r.json()),
  
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
