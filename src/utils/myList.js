import { auth } from "../firebase";

// Local storage keys
const MY_LIST_KEY = () => {
  const user = auth.currentUser;
  const userId = user?.uid || 'anonymous';
  return `movieflix_mylist_${userId}`;
};

const CONTINUE_KEY = () => `movieflix_continue_watching`;

/* ================= MY LIST - LOCAL STORAGE ================= */

// Get user's my list from localStorage
export const getMyList = async () => {
  try {
    const list = JSON.parse(localStorage.getItem(MY_LIST_KEY())) || [];
    return list.map(item => ({
      id: item.id,
      title: item.title,
      poster_path: item.poster_path,
      media_type: item.media_type,
      added_at: item.added_at
    }));
  } catch (error) {
    console.error('Error getting my list from localStorage:', error);
    return [];
  }
};

// Check if movie is in my list
export const isInMyList = async (id) => {
  try {
    const list = JSON.parse(localStorage.getItem(MY_LIST_KEY())) || [];
    return list.some(item => String(item.id) === String(id));
  } catch (error) {
    console.error('Error checking my list:', error);
    return false;
  }
};

// Add movie to my list in localStorage
export const addToMyList = async (movie) => {
  if (!movie?.id) {
    console.error('addToMyList: Invalid movie object', movie);
    return { success: false, error: 'Invalid movie' };
  }

  try {
    const key = MY_LIST_KEY();
    const list = JSON.parse(localStorage.getItem(key)) || [];
    
    // Check if already in list
    if (list.some(item => String(item.id) === String(movie.id))) {
      return { success: false, error: 'Movie already in list' };
    }

    // Add to list
    const newItem = {
      id: String(movie.id),
      title: movie.title || movie.name,
      poster_path: movie.poster_path || null,
      media_type: movie.media_type || 'movie',
      added_at: new Date().toISOString()
    };
    
    list.push(newItem);
    localStorage.setItem(key, JSON.stringify(list));
    
    console.log('addToMyList: Added to localStorage:', newItem);
    return { success: true, data: newItem };
  } catch (error) {
    console.error('addToMyList: Error:', error);
    return { success: false, error: error.message || 'Failed to add' };
  }
};

// Remove movie from my list in localStorage
export const removeFromMyList = async (id) => {
  try {
    const key = MY_LIST_KEY();
    const list = JSON.parse(localStorage.getItem(key)) || [];
    
    const filtered = list.filter(item => String(item.id) !== String(id));
    localStorage.setItem(key, JSON.stringify(filtered));
    
    return { success: true };
  } catch (error) {
    console.error('Error removing from my list:', error);
    return { success: false, error: error.message };
  }
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
