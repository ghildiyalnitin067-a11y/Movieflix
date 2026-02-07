import React, { useState, useEffect, useRef } from "react";
import "./Navbar.css";

import logo from "../../assets/logo.png";
import defaultAvatar from "../../assets/profile_img.png";

import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY;
const SEARCH_KEY = "movieflix_search_history";

const Navbar = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);


  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem(SEARCH_KEY)) || []
  );


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);


  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${query}`
      );
      const data = await res.json();
      setResults(data.results?.slice(0, 6) || []);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);


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
    navigate(`/search?q=${encodeURIComponent(text)}`);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const profileImage =
    user?.photoURL || user?.providerData?.[0]?.photoURL || defaultAvatar;

  return (
    <>
   
      {searchOpen && (
        <div className="search-overlay">
          <div className="search-container">
            <button
              className="search-close"
              onClick={() => setSearchOpen(false)}
            >
              ✕
            </button>

            <input
              ref={inputRef}
              autoFocus
              placeholder="Search movies, shows, genres..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {results.length > 0 && (
              <div className="search-results">
                {results.map((movie) => (
                  <div
                    key={movie.id}
                    className="search-item"
                    onClick={() => handleSearch(movie.title)}
                  >
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                          : "/assets/no-poster.png"
                      }
                      alt=""
                    />
                    <span>{movie.title}</span>
                  </div>
                ))}
              </div>
            )}

            {!query && history.length > 0 && (
              <div className="search-history">
                <div className="history-header">
                  <h4>Recent</h4>
                  <button
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem(SEARCH_KEY);
                    }}
                  >
                    Clear
                  </button>
                </div>

                <div className="history-grid">
                  {history.map((item, i) => (
                    <div
                      key={i}
                      className="history-card"
                      onClick={() => handleSearch(item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
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
        />

        
        <div className="nav-center">
          <p onClick={() => navigate("/")}>Home</p>
          <p onClick={() => navigate("/movies")}>Movies</p>
          <p onClick={() => navigate("/support")}>Support</p>
          <p onClick={() => navigate("/subscription")}>Subscription</p>
        </div>

 
        <div className="nav-right">

          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="nav-search-icon"
            onClick={() => setSearchOpen(true)}
          />


          <div className="profile-wrapper" ref={dropdownRef}>
            <img
              src={profileImage}
              className="profile-avatar"
              onClick={() => setShowDropdown(!showDropdown)}
            />

            {showDropdown && (
              <div className="profile-dropdown">
                <div className="profile-mini">
                  <img src={profileImage} alt="" />
                  <div className="p-mini">
                    <strong>{user?.displayName || "User"}</strong>
                    <span>{user?.email}</span>
                  </div>
                </div>

                <button onClick={() => navigate("/account")}>
                  Account
                </button>
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  Logout
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
        </div>
      )}
    </>
  );
};

export default Navbar;
