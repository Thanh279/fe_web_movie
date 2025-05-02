/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHeart, FaTrashAlt } from 'react-icons/fa';
import { fetchUserInfo } from '../Auth/utils/auth';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch user info and favorites
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Vui lòng đăng nhập để xem danh sách yêu thích.');
        navigate('/login');
        return;
      }

      try {
        // Fetch user info
        const userData = await fetchUserInfo();
        const userInfo = {
          name: userData.name || localStorage.getItem('userName') || 'Người dùng',
          id: userData.id || localStorage.getItem('userId') || 'unknown',
          email: userData.email || localStorage.getItem('userEmail') || 'unknown',
        };
        setUser(userInfo);

        // Fetch favorites
        const response = await axios.get('http://localhost:8080/api/v1/favorites', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        });

        // Access the nested data array
        const favoritesData = response.data?.data?.data || [];
        if (!Array.isArray(favoritesData)) {
          setError('Dữ liệu yêu thích không đúng định dạng. Vui lòng thử lại sau.');
          setFavorites([]);
          return;
        }

        // Normalize and validate data
        const normalizedData = favoritesData
          .map((item) => ({
            id: item.id || 'unknown',
            seriesId: item.seriesId || 'unknown',
            title: item.title && item.title !== 'string' ? item.title : 'Không có tiêu đề',
            posterPath:
              item.posterPath &&
              item.posterPath !== 'string' &&
              item.posterPath.includes('http')
                ? item.posterPath
                : 'https://picsum.photos/200/300',
            addedAt: item.addedAt || new Date().toISOString(),
          }))
          .filter((item) => item.seriesId !== 'unknown')
          .sort((a, b) => new Date(a.addedAt) - new Date(b.addedAt)); // Sort by addedAt in ascending order (oldest first)

        setFavorites(normalizedData);
      } catch (err) {
        console.error('[Favorites] Error fetching data:', {
          message: err.message,
          response: err.response ? { status: err.response.status, data: err.response.data } : 'No response',
        });
        let errorMessage = 'Không thể tải danh sách yêu thích. Vui lòng thử lại sau.';
        if (err.response?.status === 403) {
          errorMessage = 'Bạn không có quyền truy cập danh sách yêu thích.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
          localStorage.clear();
          navigate('/login');
        } else if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Handle removing all favorites
  const removeAllFavorites = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Vui lòng đăng nhập để xóa tất cả phim yêu thích.');
      navigate('/login');
      return;
    }

    try {
      for (const favorite of favorites) {
        await axios.delete(`http://localhost:8080/api/v1/favorites/${favorite.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        });
      }
      setFavorites([]);
    } catch (err) {
      console.error('[Favorites] Error removing all favorites:', err);
      let errorMessage = 'Không thể xóa tất cả phim yêu thích. Vui lòng thử lại.';
      if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
        localStorage.clear();
        navigate('/login');
      }
      setError(errorMessage);
    }
  };

  // Handle removing a single favorite
  const removeFavorite = async (favoriteId) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Vui lòng đăng nhập để xóa phim yêu thích.');
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`http://localhost:8080/api/v1/favorites/${favoriteId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });
      setFavorites(favorites.filter((item) => item.id !== favoriteId));
    } catch (err) {
      console.error('[Favorites] Error removing favorite:', err);
      let errorMessage = 'Không thể xóa phim yêu thích. Vui lòng thử lại.';
      if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
        localStorage.clear();
        navigate('/login');
      }
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-white text-3xl font-normal mb-8 flex items-center justify-center space-x-3">
        <FaHeart className="text-white text-3xl" />
        <span>Phim yêu thích</span>
      </h2>
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 text-red-400 rounded-lg text-center">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center mb-6 max-w-4xl mx-auto">
        <div>
          <button className="bg-[#00bfff] text-white text-sm px-4 py-2 rounded">
            Bạn có {favorites.length} phim yêu thích
          </button>
        </div>
        {favorites.length > 0 && (
          <div>
            <button
              onClick={removeAllFavorites}
              className="bg-[#ffbb00] text-black text-sm px-4 py-2 rounded flex items-center space-x-2"
            >
              <FaTrashAlt />
              <span>Xóa phim yêu thích</span>
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-start gap-6 max-w-4xl mx-auto">
        {favorites.length === 0 ? (
          <div className="text-gray-400 text-center w-full">
            <p className="text-xl">Chưa có phim nào trong danh sách yêu thích.</p>
            <p className="text-sm mt-2">
              Hãy thêm phim yêu thích từ trang chi tiết của phim.
            </p>
          </div>
        ) : (
          favorites.map((item) => (
            <div key={item.id} className="relative rounded-lg overflow-hidden w-36 cursor-pointer">
              <Link to={`/series/tmdb/${item.seriesId}`}>
                <img
                  alt={`Poster of ${item.title}`}
                  className="w-full h-auto rounded-lg"
                  height="216"
                  src={item.posterPath}
                  width="144"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://picsum.photos/200/300';
                  }}
                />
              </Link>
              <button
                aria-label={`Remove ${item.title} from favorites`}
                onClick={() => removeFavorite(item.id)}
                className="absolute top-2 right-2 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-gray-300"
              >
                ×
              </button>
              <div className="mt-1 text-xs text-white truncate">{item.title}</div>
            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default Favorites;