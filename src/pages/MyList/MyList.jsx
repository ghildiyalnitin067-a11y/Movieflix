import React, { useEffect, useState } from "react";
import "./MyList.css";
import { useNavigate } from "react-router-dom";
import { getMyList, removeFromMyList } from "@/utils/myList";
import { GENRES } from "@/constants/genres";

const MyList = () => {
  const [movies, setMovies] = useState([]);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    setMovies(getMyList());
  }, []);


  const handleRemove = (id) => {
    removeFromMyList(id);
    setMovies(getMyList());
  };


  const filteredMovies =
    filter === "All"
      ? movies
      : movies.filter((m) => m.genre_ids?.includes(Number(filter)));

  return (
    <div className="ml-page">
      <div className="ml-header">
        <h1 className="ml-title">My List</h1>


        <select
          className="ml-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          {Object.entries(GENRES).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {filteredMovies.length === 0 ? (
        <p className="ml-empty">No movies found</p>
      ) : (
        <div className="ml-grid">
          {filteredMovies.map((movie, index) => (
            <div
              key={movie.id}
              className="ml-card"
              style={{ animationDelay: `${index * 80}ms` }}
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

              <div className="ml-overlay">
                <span>{movie.title}</span>

                <button
                  className="ml-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(movie.id);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyList;
