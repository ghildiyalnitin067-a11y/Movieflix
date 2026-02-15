import React, { useState, useEffect } from "react";
import "./MyList.css";
import { useNavigate } from "react-router-dom";
import { getMyList, removeFromMyList } from "@/utils/myList";
import { GENRES } from "@/constants/genres";

const MyList = () => {
  const [movies, setMovies] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadMyList = async () => {
    setLoading(true);
    const list = await getMyList();
    setMovies(list);
    setLoading(false);
  };

  // Load my list from database on mount
  useEffect(() => {
    loadMyList();
  }, []);

  const loadMyListWrapper = async () => {
    setLoading(true);
    const list = await getMyList();
    setMovies(list);
    setLoading(false);
  };

  const handleRemove = async (id) => {
    const result = await removeFromMyList(id);
    if (result.success) {
      await loadMyList(); // Refresh from database
    } else {
      alert("Failed to remove: " + result.error);
    }
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

      {loading ? (
        <p className="ml-empty">Loading your list...</p>
      ) : filteredMovies.length === 0 ? (
        <p className="ml-empty">No movies in your list. Start adding movies!</p>
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
