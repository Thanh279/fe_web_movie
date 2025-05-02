// services/GenreService.js
const TMDB_URL = 'https://api.themoviedb.org/3/genre/movie/list?language=vi';
const BACKEND_URL = 'http://localhost:8080/api/genres';

export const fetchGenresFromTMDB = async () => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
    },
  };
  const response = await fetch(TMDB_URL, options);
  if (!response.ok) {
    throw new Error('Không thể lấy danh sách thể loại từ TMDB');
  }
  const data = await response.json();
  return data.genres;
};

export const sendGenresToBackend = async (genres) => {
  const response = await fetch(`${BACKEND_URL}/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(genres.map(genre => ({ name: genre.name }))),
  });
  if (!response.ok) {
    throw new Error('Không thể gửi thể loại đến backend');
  }
};

export const fetchGenresFromBackend = async () => {
  const response = await fetch(BACKEND_URL);
  if (!response.ok) {
    throw new Error('Không thể lấy thể loại từ backend');
  }
  const result = await response.json();
  return result.data || [];
};
