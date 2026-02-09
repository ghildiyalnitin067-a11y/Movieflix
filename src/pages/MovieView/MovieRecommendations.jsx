import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MovieRecommendations.css";
import { addToMyList } from "@/utils/myList";


const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieRecommendations = ({ movieId, movieTitle, genres = [] }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genreName, setGenreName] = useState("");
  const rowRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!movieId) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        let data;
        
        // If genres are available, fetch movies by the first/main genre
        if (genres && genres.length > 0) {
          const mainGenre = genres[0];
          setGenreName(mainGenre.name);
          
          // Fetch movies by genre
          const res = await fetch(
            `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${mainGenre.id}&sort_by=popularity.desc&vote_count.gte=100&page=1`
          );
          data = await res.json();
          
          // Filter out the current movie from recommendations
          const filteredMovies = (data.results || []).filter(
            (movie) => movie.id !== movieId
          );
          setMovies(filteredMovies);
        } else {
          // Fallback to similar movies if no genres available
          const res = await fetch(
            `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${API_KEY}`
          );
          data = await res.json();
          setMovies(data.results || []);
        }
      } catch (err) {
        console.error("Recommendation error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [movieId, genres]);

  const scrollLeft = () => {
    rowRef.current?.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRight = () => {
    rowRef.current?.scrollBy({ left: 400, behavior: "smooth" });
  };

  // Don't show section if no movies found
  if (!loading && movies.length === 0) {
    return null;
  }

  return (
    <div>
      <section className="movie-row">
        <div className="row-header">
          <h2>
            {genreName ? (
              <>
                More <span>{genreName}</span> Movies
              </>
            ) : (
              <>
                Because you watched <span>{movieTitle}</span>
              </>
            )}
          </h2>

          {!loading && movies.length > 0 && (
            <div className="row-arrows">
              <button onClick={scrollLeft}>❮</button>
              <button onClick={scrollRight}>❯</button>
            </div>
          )}
        </div>

        <div className="row-posters" ref={rowRef}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div className="poster-skeleton" key={i} />
              ))
            : movies.map((movie) => (
                <div
                  key={movie.id}
                  className="poster-card"
                  onClick={() => navigate(`/movie/${movie.id}`)}
                >
                  <div className="poster-img-wrapper">
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : "/assets/no-poster.png"
                      }
                      alt={movie.title}
                    />

                    <div className="poster-overlay">
                      <h4>{movie.title}</h4>
                      <p>
                        {movie.overview
                          ? movie.overview.slice(0, 120) + "..."
                          : "No description available"}
                      </p>
                      <div className="poster-ac">
                        <span className="rating">
                          ★ {movie.vote_average?.toFixed(1)}
                        </span>
                        <button
                          className="add-btn"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const result = await addToMyList(movie);
                            if (result.success) {
                              alert(`"${movie.title}" added to your list!`);
                            } else {
                              alert("Failed to add: " + result.error);
                            }
                          }}
                        >
                          +
                        </button>



                      </div>
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
