import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { profileAPI } from '../services/api';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileLimits, setProfileLimits] = useState(null);

  // Load profiles from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('activeProfile');
    if (savedProfile) {
      try {
        setActiveProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Error parsing saved profile:', e);
        localStorage.removeItem('activeProfile');
      }
    }
  }, []);

  // Fetch profiles when user is authenticated
  const fetchProfiles = useCallback(async () => {
    if (!isAuthenticated || !currentUser) {
      setProfiles([]);
      setActiveProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all profiles
      const profilesData = await profileAPI.getProfiles();
      setProfiles(profilesData.profiles || []);

      // Fetch profile limits
      const limitsData = await profileAPI.getProfileLimits();
      setProfileLimits(limitsData);

      // If no active profile in state, try to get from API or set first profile
      if (!activeProfile) {
        try {
          const activeData = await profileAPI.getActiveProfile();
          if (activeData.profile) {
            setActiveProfile(activeData.profile);
            localStorage.setItem('activeProfile', JSON.stringify(activeData.profile));
          } else if (profilesData.profiles && profilesData.profiles.length > 0) {
            // Set first profile as active
            const firstProfile = profilesData.profiles[0];
            await switchProfile(firstProfile.id);
          }
        } catch (err) {
          console.error('Error fetching active profile:', err);
          // If no active profile, set first one as active
          if (profilesData.profiles && profilesData.profiles.length > 0) {
            const firstProfile = profilesData.profiles[0];
            await switchProfile(firstProfile.id);
          }
        }
      }

    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(err.message || 'Failed to load profiles');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentUser, activeProfile]);

  // Initial fetch
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Create a new profile
  const createProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await profileAPI.createProfile(profileData);
      
      // Refresh profiles list
      await fetchProfiles();
      
      return response.profile;
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err.message || 'Failed to create profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a profile
  const updateProfile = async (profileId, updates) => {
    try {
      setLoading(true);
      setError(null);

      const response = await profileAPI.updateProfile(profileId, updates);
      
      // Update local state
      setProfiles(prev => prev.map(p => 
        p.id === profileId ? { ...p, ...response.profile } : p
      ));

      // If updating active profile, update that too
      if (activeProfile && activeProfile.id === profileId) {
        const updatedActive = { ...activeProfile, ...response.profile };
        setActiveProfile(updatedActive);
        localStorage.setItem('activeProfile', JSON.stringify(updatedActive));
      }

      return response.profile;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a profile
  const deleteProfile = async (profileId) => {
    try {
      setLoading(true);
      setError(null);

      await profileAPI.deleteProfile(profileId);
      
      // Remove from local state
      setProfiles(prev => prev.filter(p => p.id !== profileId));

      // If deleting active profile, clear it
      if (activeProfile && activeProfile.id === profileId) {
        setActiveProfile(null);
        localStorage.removeItem('activeProfile');
        
        // Set another profile as active if available
        const remainingProfiles = profiles.filter(p => p.id !== profileId);
        if (remainingProfiles.length > 0) {
          await switchProfile(remainingProfiles[0].id);
        }
      }

      // Refresh limits
      const limitsData = await profileAPI.getProfileLimits();
      setProfileLimits(limitsData);

    } catch (err) {
      console.error('Error deleting profile:', err);
      setError(err.message || 'Failed to delete profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Switch to a different profile
  const switchProfile = async (profileId, pin = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await profileAPI.switchProfile(profileId, pin);
      
      setActiveProfile(response.profile);
      localStorage.setItem('activeProfile', JSON.stringify(response.profile));
      
      // Refresh profiles to update isActive status
      await fetchProfiles();

      return response.profile;
    } catch (err) {
      console.error('Error switching profile:', err);
      setError(err.message || 'Failed to switch profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add to watch history
  const addToWatchHistory = async (watchData) => {
    if (!activeProfile) return;

    try {
      await profileAPI.addToWatchHistory(activeProfile.id, watchData);
    } catch (err) {
      console.error('Error adding to watch history:', err);
    }
  };

  // Get continue watching
  const getContinueWatching = async () => {
    if (!activeProfile) return [];

    try {
      const response = await profileAPI.getContinueWatching(activeProfile.id);
      return response.items || [];
    } catch (err) {
      console.error('Error getting continue watching:', err);
      return [];
    }
  };

  // Add to my list
  const addToMyList = async (itemData) => {
    if (!activeProfile) {
      throw new Error('No active profile selected');
    }

    try {
      await profileAPI.addToProfileMyList(activeProfile.id, itemData);
      
      // Update local state
      setActiveProfile(prev => ({
        ...prev,
        myListCount: (prev.myListCount || 0) + 1
      }));
    } catch (err) {
      console.error('Error adding to my list:', err);
      throw err;
    }
  };

  // Remove from my list
  const removeFromMyList = async (contentId) => {
    if (!activeProfile) {
      throw new Error('No active profile selected');
    }

    try {
      await profileAPI.removeFromProfileMyList(activeProfile.id, contentId);
      
      // Update local state
      setActiveProfile(prev => ({
        ...prev,
        myListCount: Math.max(0, (prev.myListCount || 0) - 1)
      }));
    } catch (err) {
      console.error('Error removing from my list:', err);
      throw err;
    }
  };

  // Get my list
  const getMyList = async () => {
    if (!activeProfile) return [];

    try {
      const response = await profileAPI.getProfileMyList(activeProfile.id);
      return response.myList || [];
    } catch (err) {
      console.error('Error getting my list:', err);
      return [];
    }
  };

  // Check if content is in my list
  const isInMyList = async (contentId) => {
    if (!activeProfile) return false;

    try {
      const myList = await getMyList();
      return myList.some(item => item.contentId === contentId);
    } catch (err) {
      console.error('Error checking my list:', err);
      return false;
    }
  };

  // Get default avatars
  const getDefaultAvatars = async (type = 'adult') => {
    try {
      const response = await profileAPI.getDefaultAvatars(type);
      return response.avatars || [];
    } catch (err) {
      console.error('Error getting avatars:', err);
      return [];
    }
  };

  // Clear error
  const clearError = () => setError(null);

  const value = {
    profiles,
    activeProfile,
    loading,
    error,
    profileLimits,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile,
    addToWatchHistory,
    getContinueWatching,
    addToMyList,
    removeFromMyList,
    getMyList,
    isInMyList,
    getDefaultAvatars,
    refreshProfiles: fetchProfiles,
    clearError
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;
