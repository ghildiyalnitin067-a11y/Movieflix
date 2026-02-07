import { auth } from "../firebase";

/* 🔐 USER-SCOPED KEYS */
const getUID = () => auth.currentUser?.uid || "guest";

const MYLIST_KEY = () => `movieflix_${getUID()}_mylist`;
const CONTINUE_KEY = () => `movieflix_${getUID()}_continue`;

/* ================= MY LIST ================= */

export const getMyList = () => {
  try {
    return JSON.parse(localStorage.getItem(MYLIST_KEY())) || [];
  } catch {
    return [];
  }
};

export const isInMyList = (id) => {
  return getMyList().some((m) => m.id === id);
};

export const addToMyList = (movie) => {
  if (!movie?.id) return;

  const list = getMyList();
  if (list.some((m) => m.id === movie.id)) return;

  const clean = {
    id: movie.id,
    title: movie.title || movie.name,
    poster_path: movie.poster_path,
    genre_ids: movie.genre_ids || [],
  };

  localStorage.setItem(
    MYLIST_KEY(),
    JSON.stringify([clean, ...list])
  );
};

export const removeFromMyList = (id) => {
  const list = getMyList().filter((m) => m.id !== id);
  localStorage.setItem(
    MYLIST_KEY(),
    JSON.stringify(list)
  );
};

/* ================= CONTINUE WATCHING ================= */

export const getContinueWatching = () => {
  try {
    return JSON.parse(
      localStorage.getItem(CONTINUE_KEY())
    ) || [];
  } catch {
    return [];
  }
};

export const addToContinueWatching = (movie) => {
  if (!movie?.id) return;

  const list = getContinueWatching().filter(
    (m) => m.id !== movie.id
  );

  const clean = {
    id: movie.id,
    title: movie.title || movie.name,
    poster_path: movie.poster_path,
  };

  localStorage.setItem(
    CONTINUE_KEY(),
    JSON.stringify([clean, ...list].slice(0, 10))
  );
};
