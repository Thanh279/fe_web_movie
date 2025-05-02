import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiFilm, FiSearch, FiUser, FiClock, FiBookmark } from 'react-icons/fi';
import { fetchUserInfo } from '../Auth/utils/auth';

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  useEffect(() => {
    const checkUser = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        try {
          const userData = await fetchUserInfo();
          const userInfo = {
            name: userData.name || userData.data?.name || localStorage.getItem('userName') || 'Người dùng',
            id: userData.id || userData.data?.id,
            email: userData.email || userData.data?.email,
          };
          setUser(userInfo);
        } catch (err) {
          console.error('[Header] Failed to fetch user info:', {
            message: err.message,
            response: err.response ? {
              status: err.response.status,
              data: err.response.data,
            } : 'No response received',
          });
          const storedName = localStorage.getItem('userName');
          if (storedName) {
            setUser({ name: storedName });
          } else {
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchGenresFromTMDB = async () => {
      const url = 'https://api.themoviedb.org/3/genre/tv/list?language=vi';
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
          throw new Error('Failed to fetch genres from TMDB');
        }
        const data = await response.json();
        if (isMounted) {
          await sendGenresToBackend(data.genres);
          fetchGenresFromBackend();
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    const sendGenresToBackend = async (genres) => {
      try {
        const backendUrl = 'http://localhost:8080/api/genres/bulk';
        const genreDTOs = genres.map((genre) => ({
          name: genre.name,
          tmdbGenreId: genre.id,
        }));
        console.log('Sending genres to backend:', genreDTOs);
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(genreDTOs),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to save genres to backend: ${errorText}`);
        }
        console.log('Genres saved to backend successfully');
      } catch (err) {
        console.error('Error sending genres to backend:', err.message);
        setError(err.message);
      }
    };

    const fetchGenresFromBackend = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/genres');
        if (!response.ok) {
          throw new Error('Failed to fetch genres from backend');
        }
        const result = await response.json();
        console.log('Genres response:', result);
        if (isMounted) {
          const genresData = result.data.data || [];
          if (!Array.isArray(genresData)) {
            throw new Error('Genres data from backend is not an array');
          }
          setGenres(genresData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchGenresFromTMDB();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.length < 1) {
        setSearchResults([]);
        setIsDropdownVisible(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/series/search?query=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch search results from backend');
        }
        const data = await response.json();
        console.log('Search response:', data);
        const results = Array.isArray(data) ? data : (data.data || []);
        const formattedResults = results.map((result) => ({
          tmdbId: result.tmdbId || result.id,
          title: result.title || result.name,
          posterPath: result.posterPath && result.posterPath.startsWith('/')
            ? `https://image.tmdb.org/t/p/w300${result.posterPath}`
            : result.posterPath || 'https://via.placeholder.com/50x70',
          episodeCount: result.episodeCount || 'N/A',
        }));
        setSearchResults(formattedResults);
        setIsDropdownVisible(true);
      } catch (err) {
        setError(err.message);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setUser(null);
    navigate('/');
  };

  const handleSearchItemClick = (tmdbId, title) => {
    navigate(`/series/tmdb/${tmdbId}`);
    setSearchQuery(title);
    setIsDropdownVisible(false);
  };

  const handleViewMore = () => {
    navigate(`/search/${encodeURIComponent(searchQuery.trim())}`);
    setIsDropdownVisible(false);
  };

  if (loading && !searchResults.length) {
    return <p className="text-center text-gray-400 text-lg">Đang tải...</p>;
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

        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center bg-white rounded-md overflow-hidden">
            <input
              type="text"
              placeholder="tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleViewMore()}
              className="flex-grow px-4 py-2 text-black text-base outline-none"
            />
            <button
              onClick={handleViewMore}
              className="bg-[#3B3B43] text-white text-sm font-semibold px-4 py-2 rounded-r-md"
            >
              Tìm
            </button>
          </div>
          {isDropdownVisible && searchResults.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-[#2B2C33] rounded-md max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#3B3B43] scrollbar-track-[#2B2C33] z-50">
              <ul>
                {searchResults.map((result) => (
                  <li
                    key={result.tmdbId}
                    className="flex gap-3 p-2 border-b border-[#3B3B43] hover:bg-[#3B3B43] cursor-pointer"
                    onClick={() => handleSearchItemClick(result.tmdbId, result.title)}
                  >
                    <img
                      alt={`${result.title} poster`}
                      className="w-[50px] h-[70px] object-cover flex-shrink-0 rounded-sm"
                      src={result.posterPath}
                      width="50"
                      height="70"
                    />
                    <div className="text-white">
                      <p className="font-semibold text-sm leading-tight truncate max-w-[180px]">
                        {result.title}
                      </p>
                    
                    </div>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleViewMore}
                className="w-full bg-[#2DBFF4] text-white text-base font-normal py-3 rounded-b-md"
              >
                Xem thêm
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <FiUser className="text-blue-400 mr-2" />
            <Link
              to="/profile"
              className={`${location.pathname === '/profile' ? 'text-blue-400 font-semibold' : 'hover:text-blue-400'}`}
            >
              Tài khoản
            </Link>
          </div>
          <div className="flex items-center">
            <FiClock className="text-blue-400 mr-2" />
            <Link
              to="/watch-history"
              className={`${location.pathname === '/watch-history' ? 'text-blue-400 font-semibold' : 'hover:text-blue-400'}`}
            >
              Lịch sử xem
            </Link>
          </div>
          <div className="flex items-center">
            <FiBookmark className="text-blue-400 mr-2" />
            <Link
              to="/favorites"
              className={`${location.pathname === '/favorites' ? 'text-blue-400 font-semibold' : 'hover:text-blue-400'}`}
            >
              Phim yêu thích
            </Link>
          </div>
        </div>

        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-white font-medium">{user.name || 'Người dùng'}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded-md hover:bg-red-600 transition text-white"
            >
              Đăng Xuất
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition text-white"
          >
            Đăng Nhập
          </Link>
        )}
      </nav>

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-50 overflow-y-auto max-h-screen`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Thể loại phim</h2>
          <button onClick={toggleDrawer} className="text-2xl">
            <FiX />
          </button>
        </div>
        <ul className="p-4 space-y-4">
          {genres.map((genre) => (
            <li key={genre.tmdbGenreId}>
              <Link
                to={`/category/${genre.tmdbGenreId}`}
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