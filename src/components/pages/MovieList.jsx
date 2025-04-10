import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Lưu tổng số trang từ API

  // Gọi API danh sách phim từ TMDB
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true); // Reset loading khi chuyển trang
      const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=vi&page=${currentPage}&sort_by=popularity.desc`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
        },
      };

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error('Không thể tải danh sách phim từ TMDB');
        }
        const data = await response.json();
        setMovies(data.results); // Cập nhật danh sách phim
        setTotalPages(data.total_pages); // Lưu tổng số trang
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMovies();
  }, [currentPage]); // Gọi lại API khi currentPage thay đổi

  // Hàm chuyển trang
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Xử lý trạng thái giao diện
  if (loading) return <p className="text-center text-gray-400 text-lg">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-center text-red-500 text-lg">Lỗi: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">
          Phim Phổ Biến Nhất
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <Link to={`/movie/${movie.id}`} key={movie.id}>
              <div className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition-colors">
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                      : 'https://via.placeholder.com/300x450'
                  }
                  alt={movie.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <h2 className="text-lg font-semibold text-white truncate">{movie.title}</h2>
                <p className="text-sm text-gray-400">
                  Năm: {movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}
                </p>
                <p className="text-sm text-gray-400">Điểm: {movie.vote_average}/10</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Phân trang */}
        <div className="flex justify-center mt-6 space-x-2">
          <button
            className={`px-4 py-2 rounded bg-gray-700 text-white ${
              currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
            }`}
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-400">
            Trang {currentPage} / {totalPages}
          </span>
          <button
            className={`px-4 py-2 rounded bg-gray-700 text-white ${
              currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
            }`}
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieList;