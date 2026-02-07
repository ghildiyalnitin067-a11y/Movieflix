import React, { useState, useEffect } from "react";
import "./Movies.css";
import MoviesCategories from "./MoviesCategories";

const heroMovies = [
  {
    id: "the_big_fake",
    title: "The Big Fake",
    desc:
      "Toni Chichiarelli arrives in Rome with the dream of becoming a painter, but his talent leads him elsewhere — from art galleries to state secrets.",
    img: "https://image.tmdb.org/t/p/original/8Y43POKjjKDGI9MH89NW0NAzzp8.jpg",
  },
  {
    id: "interstellar",
    title: "Interstellar",
    desc:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival beyond Earth.",
    img: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
  },
  {
    id: "spiderverse",
    title: "Spider-Man: Across the Spider-Verse",
    desc:
      "Miles Morales returns for the next chapter of the Spider-Verse saga, crossing dimensions with new allies and enemies.",
    img: "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
  },
  {
    id: "dune_part_two",
    title: "Dune: Part Two",
    desc:
      "Paul Atreides unites with the Fremen to seek revenge against the conspirators.",
    img: "https://image.tmdb.org/t/p/original/8uVKfOJUhmybNsVh089EqLHUYEG.jpg",
  },
];

const Movies = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroMovies.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
    <div className="movies-page">
  
      <section className="hero-section">
        <div className="hero-banner">
          <div
            className="hero-track"
            style={{
              transform: `translateX(-${current * 100}%)`,
            }}
          >
            {heroMovies.map((movie) => (
              <div className="hero-slide" key={movie.id}>
                <img src={movie.img} alt={movie.title} />
                <div className="hero-overlay" />

                <div className="hero-content">
                  <h1>{movie.title}</h1>
                  <p>{movie.desc}</p>

                  <div className="hero-actions">
                    <button className="play-btn">▶ Play</button>
                    <button className="icon-btn">👍</button>
                    <button className="icon-btn">🔊</button>
                  </div>
                </div>
              </div>
            ))}
          </div>


          <button
            className="hero-arrow left"
            onClick={() =>
              setCurrent(
                current === 0 ? heroMovies.length - 1 : current - 1
              )
            }
          >
            ←
          </button>

          <button
            className="hero-arrow right"
            onClick={() =>
              setCurrent((current + 1) % heroMovies.length)
            }
          >
            →
          </button>

          <div className="hero-dots">
            {heroMovies.map((_, i) => (
              <span
                key={i}
                className={`dot ${i === current ? "active" : ""}`}
                onClick={() => setCurrent(i)}
              />
            ))}
          </div>
        </div>
      </section>

 
      
    </div>
    <MoviesCategories />
    </div>
  );
};

export default Movies;
