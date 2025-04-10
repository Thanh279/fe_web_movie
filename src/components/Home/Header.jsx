import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX, FiFilm, FiSearch, FiBookmark, FiClock } from "react-icons/fi";

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  useEffect(() => {
    const fetchGenres = async () => {
      const url = 'https://api.themoviedb.org/3/genre/movie/list?language=vi';
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
          throw new Error('Không thể tải danh sách thể loại từ TMDB');
        }
        const data = await response.json();
        setGenres(data.genres);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  
  if (loading) {
    return <p className="text-center text-gray-400 text-lg">Đang tải dữ liệu...</p>;
  }
  if (error) {
    return <p className="text-center text-red-500 text-lg">Lỗi: {error}</p>;
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between p-4 bg-gray-800 text-white shadow-md">
        <div className="flex items-center">
          <button className="text-2xl mr-4" onClick={toggleDrawer}>
            <FiMenu />
          </button>
          <Link to="/" className="flex items-center">
            <span className="text-blue-500 text-xl font-bold">THÀNH</span>
            <span className="text-red-500 text-xl font-bold">.HUY</span>
          </Link>
        </div>

        <div className="flex items-center">
          <input
            type="text"
            placeholder="Tìm kiếm phim"
            className="p-2 rounded-l-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
          />
          <button className="p-2 bg-gray-600 rounded-r-md hover:bg-gray-500 transition">
            <FiSearch />
          </button>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <FiClock className="text-blue-400 mr-2" />
            <span>Lịch sử xem</span>
          </div>
          <div className="flex items-center">
            <FiBookmark className="text-blue-400 mr-2" />
            <span>Phim yêu thích</span>
          </div>
        </div>
        <button className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition">
          Đăng Nhập
        </button>
      </nav>

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Thể loại phim</h2>
          <button onClick={toggleDrawer} className="text-2xl">
            <FiX />
          </button>
        </div>
        <ul className="p-4 space-y-4">
          {genres.map((genre) => (  
            <li key={genre.id}>
              <Link
                to={`/category/${genre.id}`}
                onClick={toggleDrawer}
                className="flex items-center hover:text-blue-400"
              >
                <FiFilm className="mr-2" /> {genre.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={toggleDrawer}
        />
      )}
    </>
  );
};

export default Header;