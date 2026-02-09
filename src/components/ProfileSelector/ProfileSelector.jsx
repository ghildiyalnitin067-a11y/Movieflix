import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import './ProfileSelector.css';

const ProfileSelector = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    profiles, 
    activeProfile, 
    loading, 
    error, 
    profileLimits,
    switchProfile, 
    deleteProfile,
    getDefaultAvatars,
    refreshProfiles
  } = useProfile();

  const [showManageMode, setShowManageMode] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [defaultAvatars, setDefaultAvatars] = useState([]);
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(false);

  // Load default avatars
  useEffect(() => {
    const loadAvatars = async () => {
      setIsLoadingAvatars(true);
      try {
        const avatars = await getDefaultAvatars('adult');
        setDefaultAvatars(avatars);
      } catch (err) {
        console.error('Error loading avatars:', err);
      } finally {
        setIsLoadingAvatars(false);
      }
    };
    loadAvatars();
  }, [getDefaultAvatars]);

  // Handle profile click
  const handleProfileClick = async (profile) => {
    if (showManageMode) {
      // In manage mode, go to edit page
      navigate(`/manage-profile/${profile.id}`);
      return;
    }

    // If profile has PIN, show PIN modal
    if (profile.type === 'kids' || profile.pin) {
      setSelectedProfile(profile);
      setShowPinModal(true);
      setPin('');
      setPinError('');
      return;
    }

    // Switch to profile
    try {
      await switchProfile(profile.id);
      navigate('/browse');
    } catch (err) {
      console.error('Error switching profile:', err);
    }
  };

  // Handle PIN submit
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setPinError('');

    if (!selectedProfile) return;

    try {
      await switchProfile(selectedProfile.id, pin);
      setShowPinModal(false);
      setPin('');
      navigate('/browse');
    } catch (err) {
      setPinError(err.message || 'Invalid PIN');
    }
  };

  // Handle add new profile
  const handleAddProfile = () => {
    if (profileLimits && !profileLimits.canCreate) {
      return; // Can't create more profiles
    }
    navigate('/create-profile');
  };

  // Handle delete profile
  const handleDeleteProfile = async (profile) => {
    if (profiles.length <= 1) {
      alert('You must have at least one profile.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${profile.name}"?`)) {
      try {
        await deleteProfile(profile.id);
        await refreshProfiles();
      } catch (err) {
        console.error('Error deleting profile:', err);
        alert('Failed to delete profile: ' + err.message);
      }
    }
  };

  // Toggle manage mode
  const toggleManageMode = () => {
    setShowManageMode(!showManageMode);
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="profile-selector loading">
        <div className="loading-spinner"></div>
        <p>Loading profiles...</p>
      </div>
    );
  }

  return (
    <div className="profile-selector">
      <div className="profile-selector-container">
        <h1 className="profile-selector-title">
          {showManageMode ? 'Manage Profiles' : "Who's watching?"}
        </h1>

        {error && (
          <div className="profile-error">
            {error}
          </div>
        )}

        <div className="profiles-grid">
          {profiles.map((profile) => (
            <div 
              key={profile.id}
              className={`profile-card ${profile.isActive ? 'active' : ''} ${showManageMode ? 'manage-mode' : ''}`}
              onClick={() => handleProfileClick(profile)}
            >
              <div className="profile-avatar">
                <img 
                  src={profile.avatar || defaultAvatars[0]} 
                  alt={profile.name}
                  onError={(e) => {
                    e.target.src = defaultAvatars[0] || 'https://via.placeholder.com/150';
                  }}
                />
                {profile.type === 'kids' && (
                  <span className="profile-type-badge">Kids</span>
                )}
                {showManageMode && (
                  <div className="profile-edit-overlay">
                    <span className="edit-icon">✏️</span>
                  </div>
                )}
              </div>
              <span className="profile-name">{profile.name}</span>
              
              {showManageMode && (
                <button 
                  className="delete-profile-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProfile(profile);
                  }}
                >
                  🗑️
                </button>
              )}
            </div>
          ))}

          {/* Add Profile Card */}
          {!showManageMode && profileLimits?.canCreate && (
            <div 
              className="profile-card add-profile"
              onClick={handleAddProfile}
            >
              <div className="profile-avatar add-icon">
                <span>+</span>
              </div>
              <span className="profile-name">Add Profile</span>
            </div>
          )}
        </div>

        <div className="profile-actions">
          {profiles.length > 0 && (
            <button 
              className="manage-profiles-btn"
              onClick={toggleManageMode}
            >
              {showManageMode ? 'Done' : 'Manage Profiles'}
            </button>
          )}
        </div>

        {/* PIN Modal */}
        {showPinModal && selectedProfile && (
          <div className="pin-modal-overlay" onClick={() => setShowPinModal(false)}>
            <div className="pin-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Enter PIN for {selectedProfile.name}</h2>
              <form onSubmit={handlePinSubmit}>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 4-6 digit PIN"
                  maxLength={6}
                  autoFocus
                />
                {pinError && <p className="pin-error">{pinError}</p>}
                <div className="pin-actions">
                  <button type="button" onClick={() => setShowPinModal(false)}>
                    Cancel
                  </button>
                  <button type="submit">
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSelector;
