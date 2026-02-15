import React, { useEffect, useState } from "react";
import "./Home.css";
import hero_banner from "../assets/hero_banner.png";
import Button from "react-bootstrap/Button";
import Categories from "../components/Categories/Categories";
import Features from "../components/Features/Features";
import Plans from "../components/Plans/Plans";
import Testimonials from "../components/Testimonials/Testimonials";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";


const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // TMDB
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const BASE_URL = "https://api.themoviedb.org/3";

  const [trendingMovies, setTrendingMovies] = useState([]);

  useEffect(() => {
    if (!API_KEY) {
      console.error("TMDB API key missing");
      return;
    }

    axios
      .get(`${BASE_URL}/trending/movie/week`, {
        params: { api_key: API_KEY },
      })
      .then((res) => {
        setTrendingMovies(res.data.results);
        console.log("Trending movies:", res.data.results);
      })
      .catch((err) => {
        console.error("TMDB error:", err.message);
      });
  }, [API_KEY]);

  const requireLogin = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate("/login", {
        state: { from: location.pathname },
      });
      return false;
    }
    return true;
  };


  const handleStartStreaming = () => {
    if (!requireLogin()) return;
    navigate("/movies");
  };

  return (
    <div className="home">
        {/* HERO */}
        <div className="hero">
          <img src={hero_banner} className="banner-img" alt="MovieFlix Banner" />

          <div className="hero-caption">
            <h1>The Best Streaming Experience</h1>

            <p>
              MovieFlix brings you an endless collection of blockbuster movies,
              trending series, and timeless classics—all in one place. Stream
              high-quality content across every genre you love, from action and
              thrillers to romance and drama.
            </p>

            <Button className="start" onClick={handleStartStreaming}>
              ▶ Start streaming now
            </Button>
          </div>
        </div>

        {/* (TEMP) Trending Movies Test */}
        {trendingMovies.length > 0 && (
          <div style={{ display: "none" }}>
            {trendingMovies.map((movie) => (
              <span key={movie.id}>{movie.title}</span>
            ))}
          </div>
        )}

        {/* SECTIONS */}
        <Categories />
        <Features />
        <Plans />
        <Testimonials />
      </div>

  );
};

export default Home;
