import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Navbar.css";

import logo from "../../assets/logo.png";
import defaultAvatar from "../../assets/profile_img.png";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faClockRotateLeft, faXmark, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Fuse from "fuse.js";

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const SEARCH_KEY = "movieflix_search_history";

// Popular movies for fuzzy search suggestions
const POPULAR_MOVIES = [
  "Dhamaal", "Golmaal", "Hera Pheri", "Phir Hera Pheri", "Welcome",
  "Andaz Apna Apna", "3 Idiots", "PK", "Dangal", "Bajrangi Bhaijaan",
  "Sultan", "Bajirao Mastani", "Padmaavat", "Chennai Express", "Dilwale",
  "Kuch Kuch Hota Hai", "Dilwale Dulhania Le Jayenge", "Kabhi Khushi Kabhie Gham",
  "Mohabbatein", "Devdas", "Lagaan", "Rang De Basanti", "Taare Zameen Par",
  "Chak De! India", "Swades", "My Name is Khan", "Kal Ho Naa Ho", "Veer-Zaara",
  "The Shawshank Redemption", "The Godfather", "The Dark Knight", "Pulp Fiction",
  "Inception", "Fight Club", "Forrest Gump", "The Matrix", "Goodfellas",
  "The Silence of the Lambs", "Star Wars", "The Avengers", "Iron Man",
  "Spider-Man", "Batman Begins", "The Lion King", "Titanic", "Avatar",
  "Jurassic Park", "Jaws", "E.T.", "Back to the Future", "Indiana Jones"
];

const Navbar = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);

  const { user, userData, isAdmin, logout, loading } = useAuth();
  const { activeProfile, profiles } = useProfile();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem(SEARCH_KEY)) || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Initialize Fuse for fuzzy search
  const fuse = useRef(
    new Fuse(POPULAR_MOVIES, {
      keys: ["name"],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2
    })
  );

  // Debug logging
  useEffect(() => {
    console.log("Auth State:", { 
      user: user?.email, 
      userData: userData?.role, 
      isAdmin, 
      loading 
    });
  }, [user, userData, isAdmin, loading]);

  // Handle fuzzy search suggestions
  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    // Perform fuzzy search
    const fuseResults = fuse.current.search(trimmedQuery);
    const fuzzySuggestions = fuseResults
      .slice(0, 5)
      .map(result => result.item);
    
    setSuggestions(fuzzySuggestions);
  }, [query]);

  // Fetch TMDB results
  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(trimmedQuery)}`
        );
        const data = await res.json();
        setResults(data.results?.slice(0, 6) || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };

    if (searchOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const totalItems = results.length + suggestions.length + history.length;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        // Handle selection
        if (selectedIndex < results.length) {
          handleSearch(results[selectedIndex].title);
        } else if (selectedIndex < results.length + suggestions.length) {
          handleSearch(suggestions[selectedIndex - results.length]);
        } else {
          handleSearch(history[selectedIndex - results.length - suggestions.length]);
        }
      } else if (query.trim()) {
        handleSearch(query);
      }
    }
  };

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleSearch = (text) => {
    if (!text.trim()) return;

    const updated = [text, ...history.filter((h) => h !== text)].slice(0, 6);
    setHistory(updated);
    localStorage.setItem(SEARCH_KEY, JSON.stringify(updated));

    setSearchOpen(false);
    setQuery("");
    setSelectedIndex(-1);
    navigate(`/search?q=${encodeURIComponent(text)}`);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Use active profile avatar if available, otherwise fall back to user avatar
  const profileImage = activeProfile?.avatar || 
    user?.photoURL || 
    user?.providerData?.[0]?.photoURL || 
    defaultAvatar;

  // Don't show profile section if not logged in
  if (!user) {
    return (
      <nav className="nav">
        <img
          src={logo}
          className="nav-logo"
          onClick={() => navigate("/")}
          alt="MovieFlix"
        />
        
        <div className="nav-center">
          <p onClick={() => navigate("/")}>Home</p>
          <p onClick={() => navigate("/movies")}>Movies</p>
          <p onClick={() => navigate("/support")}>Support</p>
          <p onClick={() => navigate("/subscription")}>Subscription</p>
        </div>

        <div className="nav-right">
          <button 
            className="login-nav-btn"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        </div>
      </nav>
    );
  }

  return (
    <>
      {searchOpen && (
        <div className="search-overlay">
          <div className="search-container" ref={searchContainerRef}>
            <button
              className="search-close"
              onClick={() => setSearchOpen(false)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
              <input
                ref={inputRef}
                autoFocus
                placeholder="Search movies, shows, genres..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
              />
              {query && (
                <button className="clear-btn" onClick={clearSearch}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>

            {/* Loading Indicator */}
            {isLoading && (
              <div className="search-loading">
                <div className="loading-spinner"></div>
                <span>Searching...</span>
              </div>
            )}

            {/* Fuzzy Search Suggestions */}
            {suggestions.length > 0 && !isLoading && (
              <div className="search-suggestions">
                <h4 className="section-title">
                  <span>Suggestions</span>
                </h4>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={`suggestion-${index}`}
                    className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => handleSearch(suggestion)}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="suggestion-icon" />
                    <span className="suggestion-text">
                      {suggestion.split(new RegExp(`(${query})`, 'gi')).map((part, i) => 
                        part.toLowerCase() === query.toLowerCase() ? 
                          <mark key={i}>{part}</mark> : part
                      )}
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} className="arrow-icon" />
                  </div>
                ))}
              </div>
            )}

            {/* TMDB Search Results */}
            {results.length > 0 && !isLoading && (
              <div className="search-results">
                <h4 className="section-title">
                  <span>Movies & Shows</span>
                </h4>
                {results.map((movie, index) => (
                  <div
                    key={movie.id}
                    className={`search-item ${selectedIndex === (suggestions.length + index) ? 'selected' : ''}`}
                    onClick={() => handleSearch(movie.title)}
                  >
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                          : "/assets/no-poster.png"
                      }
                      alt={movie.title}
                    />
                    <div className="search-item-info">
                      <span className="search-item-title">{movie.title}</span>
                      <span className="search-item-year">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Search History */}
            {!query && history.length > 0 && (
              <div className="search-history">
                <div className="history-header">
                  <h4 className="section-title">
                    <FontAwesomeIcon icon={faClockRotateLeft} />
                    <span>Recent Searches</span>
                  </h4>
                  <button
                    className="clear-history-btn"
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem(SEARCH_KEY);
                    }}
                  >
                    Clear All
                  </button>
                </div>

                <div className="history-grid">
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className={`history-card ${selectedIndex === (suggestions.length + results.length + index) ? 'selected' : ''}`}
                      onClick={() => handleSearch(item)}
                    >
                      <FontAwesomeIcon icon={faClockRotateLeft} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && query && results.length === 0 && suggestions.length === 0 && (
              <div className="search-empty">
                <p>No results found for "{query}"</p>
                <span>Try searching with different keywords</span>
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="nav">
        <img
          src={logo}
          className="nav-logo"
          onClick={() => navigate("/")}
          alt="MovieFlix"
        />

        <div className="nav-center">
          <p onClick={() => navigate("/")}>Home</p>
          <p onClick={() => navigate("/movies")}>Movies</p>
          <p onClick={() => navigate("/support")}>Support</p>
          <p onClick={() => navigate("/subscription")}>Subscription</p>
        </div>

        <div className="nav-right">
          <div className="search-trigger" onClick={() => setSearchOpen(true)}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="nav-search-icon" />
            <span className="search-text">Search</span>
          </div>

          <div className="profile-wrapper" ref={dropdownRef}>
            <img
              src={profileImage}
              className="profile-avatar"
              onClick={() => setShowDropdown(!showDropdown)}
              alt="Profile"
            />

            {showDropdown && (
              <div className="profile-dropdown">
                <div className="profile-mini">
                  <img src={profileImage} alt="" />
                  <div className="p-mini">
                    <strong>{userData?.displayName || user?.displayName || "User"}</strong>
                    <span>{user?.email}</span>
                    {isAdmin && <span className="admin-badge">Admin</span>}
                  </div>
                </div>

                {activeProfile && (
                  <div className="active-profile-section">
                    <div className="active-profile-mini">
                      <img src={activeProfile.avatar} alt={activeProfile.name} />
                      <div>
                        <strong>{activeProfile.name}</strong>
                        <span>{activeProfile.type === 'kids' ? 'Kids Profile' : 'Adult Profile'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        navigate("/profiles");
                        setShowDropdown(false);
                      }}
                    >
                      🔄 Switch Profile
                    </button>
                  </div>
                )}

                <div className="dropdown-divider"></div>

                <button onClick={() => navigate("/account")}>
                  👤 Account
                </button>
                <button onClick={() => navigate("/my-list")}>
                  📋 My List
                </button>
                {isAdmin && (
                  <button 
                    className="admin-panel-btn"
                    onClick={() => {
                      navigate("/admin");
                      setShowDropdown(false);
                    }}
                  >
                    ⚙️ Admin Panel
                  </button>
                )}
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>

          <div
            className="hamburger"
            onClick={() => setMobileMenu(true)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {mobileMenu && (
        <div className="mobile-menu">
          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            ✕
          </button>

          <p onClick={() => navigate("/")}>Home</p>
          <p onClick={() => navigate("/movies")}>Movies</p>
          <p onClick={() => navigate("/support")}>Support</p>
          <p onClick={() => navigate("/subscription")}>
            Subscription
          </p>
          {isAdmin && (
            <p onClick={() => navigate("/admin")}>⚙️ Admin Panel</p>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
