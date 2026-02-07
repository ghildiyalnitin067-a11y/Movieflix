import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import "./CategoryMovies.css";
import {
  addToMyList,
  removeFromMyList,
  isInMyList,
} from "@/utils/myList";


const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

/* GENRE LABELS */
const GENRE_LABELS = {
  28: "Action",
  35: "Comedy",
  18: "Drama",
  27: "Horror",
  10749: "Romance",
  12: "Adventure",
  53: "Thriller",
  878: "Sci-Fi",
  anime: "Anime",
};

const CategoryMovies = () => {
  const { genreId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transition, setTransition] = useState(false);

  const genreName = GENRE_LABELS[genreId] || "Movies";

  useEffect(() => {
    const fetchMovies = async () => {
      setTransition(true);
      setLoading(true);

      try {
        const url =
          genreId === "anime"
            ? `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=16&with_keywords=210024&page=${page}`
            : `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`;

        const res = await fetch(url);
        const data = await res.json();
        setMovies(data.results || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setTimeout(() => {
          setLoading(false);
          setTransition(false);
        }, 250);
      }
    };

    fetchMovies();
  }, [genreId, page]);

  return (
    <div className="cm-page">
      <header className="cm-header">
        <h1>{genreName}</h1>
        <p>Browse movies by category</p>
      </header>

      <div className="cm-pagination">
        <button
          className="cm-page-btn cm-nav-btn"
          disabled={page === 1}
          onClick={() => setSearchParams({ page: page - 1 })}
        >
          ←
        </button>

        <div className="cm-page-numbers">
          {[...Array(5)].map((_, i) => {
            const p = page + i;
            return (
              <button
                key={p}
                className={
                  p === page
                    ? "cm-page-btn cm-active"
                    : "cm-page-btn"
                }
                onClick={() => setSearchParams({ page: p })}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          className="cm-page-btn cm-next-btn"
          onClick={() => setSearchParams({ page: page + 1 })}
        >
          →
        </button>
      </div>

      <div
        className={`cm-grid ${
          transition ? "cm-exit" : "cm-enter"
        }`}
      >
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div className="cm-skeleton" key={i} />
            ))
          : movies.map((movie) => (
              <div
                key={movie.id}
                className="cm-card"
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

                <div className="cm-overlay">
                  <div className="cm-overlay-top">
                    <button
                      className={`cm-add-btn ${
                        isInMyList(movie.id) ? "cm-added" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        isInMyList(movie.id)
                          ? removeFromMyList(movie.id)
                          : addToMyList(movie);
                      }}
                    >
                      {isInMyList(movie.id) ? "✓" : "＋"}
                    </button>
                  </div>

                  <h4>{movie.title}</h4>
                  <p>{movie.overview?.slice(0, 90)}...</p>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default CategoryMovies;
