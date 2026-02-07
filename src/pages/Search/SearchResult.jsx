import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SearchResult.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const SearchResults = () => {
  const query = useQuery().get("q");
  const navigate = useNavigate();
  

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    const fetchSearchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`
        );
        const data = await res.json();
        setMovies(data.results || []);
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="sr-page">
      <h1 className="sr-title">
        Search results for <span>"{query}"</span>
      </h1>

      {loading ? (
        <div className="sr-loading">Searching movies...</div>
      ) : movies.length === 0 ? (
        <div className="sr-empty">
          No movies found for <strong>{query}</strong>
        </div>
      ) : (
        <div className="sr-grid">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="sr-card"
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "/assets/no-poster.png"
                }
                alt={movie.title}
                loading="lazy"
              />

              <div className="sr-info">
                <h4>{movie.title}</h4>
                <div className="sr-meta">
                  <span>
                    {movie.release_date
                      ? movie.release_date.slice(0, 4)
                      : "—"}
                  </span>
                  <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
