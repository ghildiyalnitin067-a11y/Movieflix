import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MovieRecommendations.css";
import { addToMyList } from "@/utils/mylist";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieRecommendations = ({ movieId, movieTitle }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const rowRef = useRef(null);
  const navigate = useNavigate();


  useEffect(() => {
    if (!movieId) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${API_KEY}`
        );
        const data = await res.json();
        setMovies(data.results || []);
      } catch (err) {
        console.error("Recommendation error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [movieId]);

 
  const scrollLeft = () => {
    rowRef.current?.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = () => {
    rowRef.current?.scrollBy({ left: 400, behavior: "smooth" });
  };

  return (
    <div>
    <section className="rec-section">

      <div className="rec-header">
        <h2>
          Because you watched <span>{movieTitle}</span>
        </h2>

        {!loading && movies.length > 0 && (
          <div className="rec-arrows">
            <button onClick={scrollLeft}>❮</button>
            <button onClick={scrollRight}>❯</button>
          </div>
        )}
      </div>


      <div className="rec-row" ref={rowRef}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div className="rec-skeleton" key={i} />
            ))
          : movies.map((movie) => (
              <div
                key={movie.id}
                className="rec-card"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "/assets/no-poster.png"
                  }
                  alt={movie.title}
                />


                <div className="rec-overlay">
                  <h4>{movie.title}</h4>
                  <div className="poster-acc">
                  <span>
                    ⭐ {movie.vote_average?.toFixed(1)}
                  </span>
                     <button
                       className="add-btn"
                       onClick={(e) => {
                         e.stopPropagation(); 
                         addToMyList(movie);
                       }}
                     >
                       +
                     </button>    
                     </div>       
                </div>
              </div>
            ))}
      </div>
    </section>
    
    </div>
  );
};

export default MovieRecommendations;
