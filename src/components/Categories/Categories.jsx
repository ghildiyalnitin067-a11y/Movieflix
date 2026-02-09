import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Categories.css";


const GENRE_MAP = {
  Action: 28,
  Comedy: 35,
  Drama: 18,
  Horror: 27,
  Romance: 10749,
  Adventure: 12,
  Thriller: 53,
  "Sci-Fi": 878,
  Anime: "anime", 
};

const Categories = () => {
  const navigate = useNavigate();
  const cards = useRef(null);
  const tx = useRef(0);

  const TOTAL_CARDS = 8;


  const getVisibleCards = () => {
    if (window.innerWidth <= 768) return 2;
    if (window.innerWidth <= 992) return 2;
    if (window.innerWidth <= 1200) return 3;
    return 5;
  };




  const getCardSize = () => {
    if (window.innerWidth <= 768) return { width: 160, gap: 12 };
    if (window.innerWidth <= 992) return { width: 240, gap: 20 };
    return { width: 280, gap: 60 };
  };



  const [visibleCards, setVisibleCards] = useState(getVisibleCards());
  const [cardSize, setCardSize] = useState(getCardSize());
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const { width: CARD_WIDTH, gap: GAP } = cardSize;
  const STEP = CARD_WIDTH + GAP;


  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(getVisibleCards());
      setCardSize(getCardSize());
      setIsMobile(window.innerWidth <= 768);
      setIndex(0);
      tx.current = 0;
      if (cards.current) {
        cards.current.style.transform = `translateX(0px)`;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  const getMoveCount = () => {
    if (window.innerWidth <= 992) return 2;
    return 1;
  };


  const slideForward = () => {
    if (isMobile) return; // Disable sliding on mobile, use horizontal scroll
    const move = getMoveCount();
    const maxIndex = TOTAL_CARDS - visibleCards;
    const newIndex = Math.min(index + move, maxIndex);

    if (newIndex !== index) {
      setIndex(newIndex);
      tx.current = -newIndex * STEP;
      cards.current.style.transform = `translateX(${tx.current}px)`;
    }
  };

 
  const slideBackward = () => {
    const move = getMoveCount();
    const newIndex = Math.max(index - move, 0);

    if (newIndex !== index) {
      setIndex(newIndex);
      tx.current = -newIndex * STEP;
      cards.current.style.transform = `translateX(${tx.current}px)`;
    }
  };


  const startX = useRef(0);
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    const diff = startX.current - e.changedTouches[0].clientX;
    if (diff > 40) slideForward();
    if (diff < -40) slideBackward();
  };

 
  const goToCategory = (name) => {
    navigate(`/category/${GENRE_MAP[name]}`);
  };

  return (
    <div className="header">
      <div className="section-header">
        <div className="heading">
          <h1>Explore our variety of categories</h1>
          <p>
            Whether you're looking for action, romance, or anime — we’ve got you
            covered.
          </p>
        </div>

        {!isMobile && (
          <div className="heading-control">
            <button onClick={slideBackward}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <button onClick={slideForward}>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        )}
      </div>

      <div className="cards-section">
        <div
          className="cards-viewport"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="cards" ref={cards}>

     
            <div className="card" onClick={() => goToCategory("Action")}>
              <div className="poster-collage">
                <img src="/posters/action1.png" alt="" />
                <img src="/posters/action2.png" alt="" />
                <img src="/posters/action3.png" alt="" />
                <img src="/posters/action4.png" alt="" />
              </div>
              <div className="card-footer"><p>Action</p></div>
            </div>

         
            <div className="card" onClick={() => goToCategory("Comedy")}>
              <div className="poster-collage">
                <img src="/posters/comedy1.jpg" alt="" />
                <img src="/posters/comedy2.jpg" alt="" />
                <img src="/posters/comedy3.jpg" alt="" />
                <img src="/posters/comedy4.jpg" alt="" />
              </div>
              <div className="card-footer"><p>Comedy</p></div>
            </div>

         
             <div className="card" onClick={() => goToCategory("Horror")}>
              <div className="poster-collage">
                <img src="/posters/drama1.jpg" alt="" />
                <img src="/posters/drama2.jpg" alt="" />
                <img src="/posters/drama3.jpg" alt="" />
                <img src="/posters/drama4.jpg" alt="" />
              </div>
              <div className="card-footer"><p>Drama</p></div>
            </div>


            <div className="card" onClick={() => goToCategory("Horror")}>
              <div className="poster-collage">
                <img src="/posters/horror1.jpg" alt="" />
                <img src="/posters/horror2.jpg" alt="" />
                <img src="/posters/horro3.jpg" alt="" />
                <img src="/posters/horror4.jpg" alt="" />
              </div>
              <div className="card-footer"><p>Horror</p></div>
            </div>

    
            <div className="card" onClick={() => goToCategory("Anime")}>
              <div className="poster-collage">
                <img src="/posters/anim1.jpg" alt="" />
                <img src="/posters/anime2.jpg" alt="" />
                <img src="/posters/anime3.jpg" alt="" />
                <img src="/posters/anime4.jpg" alt="" />
              </div>
              <div className="card-footer"><p>Anime</p></div>
            </div>

  
            <div className="card" onClick={() => goToCategory("Adventure")}>
              <div className="poster-collage">
                <img src="/posters/adv1.jpg" alt="" />
                <img src="/posters/adv2.jpg" alt="" />
                <img src="/posters/adv3.jpg" alt="" />
                <img src="/posters/adv4.jpg" alt="" />
              </div>
              <div className="card-footer"><p>Adventure</p></div>
            </div>

    
            <div className="card" onClick={() => goToCategory("Thriller")}>
              <div className="poster-collage">
                <img src="/posters/th1.jpg" alt="" />
                <img src="/posters/th2.jpg" alt="" />
                <img src="/posters/th3.jpg" alt="" />
                <img src="/posters/th4.jpg" alt="" />
              </div>
              <div className="card-footer"><p>Thriller</p></div>
            </div>

      
            <div className="card" onClick={() => goToCategory("Sci-Fi")}>
              <div className="poster-collage">
                <img src="/posters/sci1.jpg" alt="" />
                <img src="/posters/sci2.jpg" alt="" />
                <img src="/posters/sci3.jpg" alt="" />
                <img src="/posters/sci4.jpg" alt="" />
              </div>
              <div className="card-footer"><p>Sci-Fi</p></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
