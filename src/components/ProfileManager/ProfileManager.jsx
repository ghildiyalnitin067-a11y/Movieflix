import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import './ProfileManager.css';

const AVATAR_COLORS = [
  '#e50914', '#46d369', '#0071eb', '#f5a623', '#8c7ae6', '#00d4aa'
];

const ProfileManager = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { profileId } = useParams();
  const { 
    createProfile, 
    updateProfile, 
    profiles, 
    profileLimits,
    getDefaultAvatars,
    loading 
  } = useProfile();

  const [formData, setFormData] = useState({
    name: '',
    type: 'adult',
    avatar: '',
    pin: '',
    confirmPin: '',
    preferences: {
      language: 'en',
      maturityRating: '18+',
      autoplay: true,
      subtitles: true
    }
  });

  const [adultAvatars, setAdultAvatars] = useState([]);
  const [kidsAvatars, setKidsAvatars] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = mode === 'edit' || profileId;
  const currentProfile = isEditMode ? profiles.find(p => p.id === profileId) : null;

  // Load avatars
  useEffect(() => {
    const loadAvatars = async () => {
      try {
        const [adult, kids] = await Promise.all([
          getDefaultAvatars('adult'),
          getDefaultAvatars('kids')
        ]);
        setAdultAvatars(adult);
        setKidsAvatars(kids);
        
        // Set default avatar if creating new profile
        if (!isEditMode && adult.length > 0 && !formData.avatar) {
          setFormData(prev => ({ ...prev, avatar: adult[0] }));
        }
      } catch (err) {
        console.error('Error loading avatars:', err);
      }
    };
    loadAvatars();
  }, [getDefaultAvatars, isEditMode]);

  // Load existing profile data in edit mode
  useEffect(() => {
    if (isEditMode && currentProfile) {
      setFormData({
        name: currentProfile.name || '',
        type: currentProfile.type || 'adult',
        avatar: currentProfile.avatar || '',
        pin: '',
        confirmPin: '',
        preferences: {
          language: currentProfile.preferences?.language || 'en',
          maturityRating: currentProfile.preferences?.maturityRating || '18+',
          autoplay: currentProfile.preferences?.autoplay !== false,
          subtitles: currentProfile.preferences?.subtitles !== false
        }
      });
    }
  }, [isEditMode, currentProfile]);

  // Update maturity rating when type changes
  useEffect(() => {
    if (formData.type === 'kids') {
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          maturityRating: '7+'
        }
      }));
    }
  }, [formData.type]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Profile name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (formData.pin) {
      if (formData.pin.length < 4 || formData.pin.length > 6) {
        newErrors.pin = 'PIN must be 4-6 digits';
      }
      if (formData.pin !== formData.confirmPin) {
        newErrors.confirmPin = 'PINs do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const profileData = {
        name: formData.name.trim(),
        type: formData.type,
        avatar: formData.avatar,
        preferences: formData.preferences
      };

      if (formData.pin) {
        profileData.pin = formData.pin;
      }

      if (isEditMode) {
        await updateProfile(profileId, profileData);
      } else {
        await createProfile(profileData);
      }

      navigate('/profiles');
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrors({ submit: err.message || 'Failed to save profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAvatarSelect = (avatar) => {
    setFormData(prev => ({ ...prev, avatar }));
  };

  const getCurrentAvatars = () => {
    return formData.type === 'kids' ? kidsAvatars : adultAvatars;
  };

  if (loading && isEditMode) {
    return (
      <div className="profile-manager loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-manager">
      <div className="profile-manager-container">
        <h1 className="profile-manager-title">
          {isEditMode ? 'Edit Profile' : 'Add Profile'}
        </h1>

        {errors.submit && (
          <div className="error-message">{errors.submit}</div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          {/* Profile Name */}
          <div className="form-group">
            <label htmlFor="name">Profile Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter profile name"
              maxLength={50}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          {/* Profile Type */}
          <div className="form-group">
            <label>Profile Type</label>
            <div className="type-toggle">
              <button
                type="button"
                className={formData.type === 'adult' ? 'active' : ''}
                onClick={() => setFormData(prev => ({ ...prev, type: 'adult' }))}
              >
                <span className="type-icon">👤</span>
                Adult
              </button>
              <button
                type="button"
                className={formData.type === 'kids' ? 'active' : ''}
                onClick={() => setFormData(prev => ({ ...prev, type: 'kids' }))}
              >
                <span className="type-icon">🧒</span>
                Kids
              </button>
            </div>
            <p className="type-description">
              {formData.type === 'kids' 
                ? 'Kids profiles have content filtering and simplified interface.' 
                : 'Adult profiles have full access to all content and features.'}
            </p>
          </div>

          {/* Avatar Selection */}
          <div className="form-group">
            <label>Choose Avatar</label>
            <div className="avatar-grid">
              {getCurrentAvatars().map((avatar, index) => (
                <div
                  key={index}
                  className={`avatar-option ${formData.avatar === avatar ? 'selected' : ''}`}
                  onClick={() => handleAvatarSelect(avatar)}
                  style={{ 
                    borderColor: formData.avatar === avatar ? AVATAR_COLORS[index % AVATAR_COLORS.length] : 'transparent'
                  }}
                >
                  <img src={avatar} alt={`Avatar ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* PIN Protection (optional) */}
          <div className="form-group">
            <label>PIN Protection (Optional)</label>
            <p className="field-description">
              Add a PIN to protect this profile. Required when switching to this profile.
            </p>
            <div className="pin-inputs">
              <input
                type="password"
                name="pin"
                value={formData.pin}
                onChange={handleChange}
                placeholder="Set PIN (4-6 digits)"
                maxLength={6}
                className={errors.pin ? 'error' : ''}
              />
              {formData.pin && (
                <input
                  type="password"
                  name="confirmPin"
                  value={formData.confirmPin}
                  onChange={handleChange}
                  placeholder="Confirm PIN"
                  maxLength={6}
                  className={errors.confirmPin ? 'error' : ''}
                />
              )}
            </div>
            {errors.pin && <span className="field-error">{errors.pin}</span>}
            {errors.confirmPin && <span className="field-error">{errors.confirmPin}</span>}
          </div>

          {/* Preferences */}
          <div className="form-group preferences-section">
            <label>Preferences</label>
            
            <div className="preference-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="preferences.autoplay"
                  checked={formData.preferences.autoplay}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Autoplay next episode
              </label>
            </div>

            <div className="preference-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="preferences.subtitles"
                  checked={formData.preferences.subtitles}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                Show subtitles by default
              </label>
            </div>

            <div className="preference-item">
              <label htmlFor="maturityRating">Content Maturity Rating</label>
              <select
                id="maturityRating"
                name="preferences.maturityRating"
                value={formData.preferences.maturityRating}
                onChange={handleChange}
                disabled={formData.type === 'kids'}
              >
                <option value="all">All Ages</option>
                <option value="7+">7+</option>
                <option value="13+">13+</option>
                <option value="16+">16+</option>
                <option value="18+">18+ (All Content)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/profiles')}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || (!isEditMode && !profileLimits?.canCreate)}
            >
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Profile')}
            </button>
          </div>

          {!isEditMode && !profileLimits?.canCreate && (
            <p className="limit-warning">
              You've reached the maximum number of profiles for your plan.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfileManager;
