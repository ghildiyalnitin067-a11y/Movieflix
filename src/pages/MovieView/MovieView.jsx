import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./MovieView.css";
import MovieRecommendations from "./MovieRecommendations";
import TrailerModal from "./TrailerModel";
import MoviesCategories from "../Movies/MoviesCategories";
import { watchHistoryAPI } from "../../services/api";



const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const MovieView = () => {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);


  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`
        );
        const data = await res.json();
        setMovie(data);

        // Track movie view when movie is loaded
        trackMovieView(data);
      } catch (err) {
        console.error("Movie fetch error:", err);
      }
    };

    fetchMovie();
  }, [id]);

  if (!movie) {
    return <div className="mv-loading">Loading...</div>;
  }


  // Track movie view in watch history
  const trackMovieView = async (movieData) => {
    if (!movieData) return;

    const watchData = {
      movieId: String(movieData.id),
      title: movieData.title,
      posterPath: movieData.poster_path ? `https://image.tmdb.org/t/p/w200${movieData.poster_path}` : null,
      genres: movieData.genres?.map(g => g.name) || [],
      duration: movieData.runtime || 120, // Default 2 hours if not available
      voteAverage: movieData.vote_average
    };

    // Save to localStorage for offline support
    const localData = {
      id: movieData.id,
      title: movieData.title,
      poster: watchData.posterPath,
      genres: watchData.genres,
      duration: watchData.duration,
      watchedAt: new Date().toISOString(),
      voteAverage: movieData.vote_average
    };

    const existingHistory = JSON.parse(localStorage.getItem("watchHistory") || "[]");
    const filteredHistory = existingHistory.filter(item => item.id !== movieData.id);
    const newHistory = [localData, ...filteredHistory].slice(0, 50);
    localStorage.setItem("watchHistory", JSON.stringify(newHistory));
    localStorage.setItem("lastActive", new Date().toISOString());

    // Save to MongoDB via API
    try {
      await watchHistoryAPI.addToWatchHistory(watchData);
      console.log("Tracked movie view in MongoDB:", watchData);
    } catch (error) {
      console.warn("Failed to save movie view to MongoDB, using localStorage only:", error);
    }
  };


  const playTrailer = async () => {
    try {
      const res = await fetch(
        `${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`
      );
      const data = await res.json();

      const trailer =
        data.results.find(
          (vid) =>
            vid.site === "YouTube" &&
            vid.type === "Trailer" &&
            vid.official
        ) ||
        data.results.find(
          (vid) =>
            vid.site === "YouTube" &&
            vid.type === "Trailer"
        );

      if (!trailer) {
        alert("Trailer not available 😢");
        return;
      }

      setTrailerKey(trailer.key);
      setShowTrailer(true);
      
      // Track movie view in watch history when trailer is played
      trackMovieView(movie);
    } catch (err) {
      console.error("Trailer fetch error:", err);
    }
  };



  return (
    <>
      <div className="mv-page">

        <section
          className="mv-hero"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
          }}
        >
          <div className="mv-overlay" />

          <div className="mv-hero-content">
            <h1 className="mv-title">{movie.title}</h1>

            <div className="mv-meta">
              <span>⭐ {movie.vote_average?.toFixed(1)}</span>
              <span>{movie.release_date?.slice(0, 4)}</span>
              <span>{movie.runtime} min</span>
            </div>

            <p className="mv-overview">{movie.overview}</p>

            <div className="mv-actions">
              <button
                className="mv-play-btn"
                onClick={playTrailer}
              >
                ▶ Play Trailer
              </button>
            </div>
          </div>
        </section>

     
        <section className="mv-details">
          <div className="mv-poster">
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : "/assets/no-poster.png"
              }
              alt={movie.title}
            />
          </div>

          <div className="mv-info">
            <h2>About this movie</h2>

            <p>{movie.overview}</p>

            <div className="mv-extra">
              <div>
                <strong>Genres:</strong>{" "}
                {movie.genres?.map((g) => g.name).join(", ")}
              </div>
              <div>
                <strong>Release Date:</strong>{" "}
                {movie.release_date}
              </div>
              <div>
                <strong>Rating:</strong>{" "}
                ⭐ {movie.vote_average?.toFixed(1)}
              </div>
            </div>
          </div>
        </section>
      </div>


      <MovieRecommendations
        movieId={movie.id}
        movieTitle={movie.title}
        genres={movie.genres}
        userId="demo-user-123"
      />


      <MoviesCategories/>

      
      {showTrailer && (
        <TrailerModal
          videoKey={trailerKey}
          onClose={() => {
            setShowTrailer(false);
            setTrailerKey(null);
          }}
        />
      )}
    </>
  );
};

export default MovieView;
