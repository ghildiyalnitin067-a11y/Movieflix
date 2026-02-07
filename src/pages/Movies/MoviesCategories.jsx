import React from "react";
import MovieRow from "./components/MoviesRow";
import "./MoviesCategories.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const MoviesCategories = () => {
  return (
    <section className="movies-categories">
      <MovieRow
        title="Popular"
        fetchUrl={`${BASE_URL}/movie/popular?api_key=${API_KEY}`}
      />

      <MovieRow
        title="Top Rated"
        fetchUrl={`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`}
      />

      <MovieRow
        title="Upcoming"
        fetchUrl={`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`}
      />

      <MovieRow
        title="Action Movies"
        fetchUrl={`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`}
      />

      <MovieRow
        title="Comedy Movies"
        fetchUrl={`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`}
      />

      <MovieRow
        title="Animation"
        fetchUrl={`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=16`}
      />
    </section>
  );
};

export default MoviesCategories;
