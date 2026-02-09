import React, { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./MoviesRow.css";
import { addToMyList } from "@/utils/myList";


const MoviesRow = ({

  title,
  fetchUrl,
  movies: externalMovies = [],
  disableFetch = false,
}) => {
  const [fetchedMovies, setFetchedMovies] = useState([]);
  const rowRef = useRef(null);
  const navigate = useNavigate();


  useEffect(() => {
    if (disableFetch) return;

    if (!fetchUrl) return;

    const fetchMovies = async () => {
      try {
        const res = await fetch(fetchUrl);
        const data = await res.json();
        setFetchedMovies(data.results || []);
      } catch (err) {
        console.error("TMDB fetch error:", err);
      }
    };

    fetchMovies();
  }, [fetchUrl, disableFetch]);

  const movies = useMemo(() => {
    return disableFetch ? externalMovies : fetchedMovies;
  }, [disableFetch, externalMovies, fetchedMovies]);


  const scrollLeft = () => {
    rowRef.current?.scrollBy({ left: -500, behavior: "smooth" });
  };

  const scrollRight = () => {
    rowRef.current?.scrollBy({ left: 500, behavior: "smooth" });
  };

  return (
    <div className="movie-row">

      <div className="row-header">
        <h2>{title}</h2>

        <div className="row-arrows">
          <button onClick={scrollLeft}>❮</button>
          <button onClick={scrollRight}>❯</button>
        </div>
      </div>

      <div className="row-posters" ref={rowRef}>
        {movies.map((movie) => (
          <div
            className="poster-card"
            key={movie.id}
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
    </div>
  );
};

export default MoviesRow;
