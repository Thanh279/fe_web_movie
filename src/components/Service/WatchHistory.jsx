/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHistory, FaTrashAlt, FaThumbsUp } from 'react-icons/fa';
import { fetchUserInfo } from '../Auth/utils/auth';

const WatchHistory = () => {
  const [watchHistory, setWatchHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch user info and watch history
  useEffect(() => {
    const fetchData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Vui lòng đăng nhập để xem lịch sử.');
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

        // Fetch watch history
        const response = await axios.get('http://localhost:8080/api/v1/watch-history', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        });

        // Access the nested data array
        const historyData = response.data?.data?.data || [];
        if (!Array.isArray(historyData)) {
          setWatchHistory([]);
          return;
        }

        // Normalize and validate data
        const normalizedData = historyData
          .map((item) => ({
            id: item.id || 'unknown',
            seriesId: item.seriesId || 'unknown',
            title: item.title && item.title !== 'string' ? item.title : 'Không có tiêu đề',
            seasonNumber: item.seasonNumber > 0 ? item.seasonNumber : 1,
            episodeNumber: item.episodeNumber > 0 ? item.episodeNumber : 1,
            posterPath:
              item.posterPath &&
              item.posterPath !== 'string' &&
              item.posterPath.includes('http')
                ? item.posterPath
                : 'https://picsum.photos/200/300',
            watchedAt: item.watchedAt || new Date().toISOString(),
          }))
          .filter((item) => item.seriesId !== 'unknown');

        setWatchHistory(normalizedData);
      } catch (err) {
        console.error('[WatchHistory] Error fetching data:', {
          message: err.message,
          response: err.response ? { status: err.response.status, data: err.response.data } : 'No response',
        });
        let errorMessage = 'Không thể tải lịch sử xem. Vui lòng thử lại sau.';
        if (err.response?.status === 403) {
          errorMessage = 'Bạn không có quyền truy cập lịch sử xem.';
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

  // Handle removing all watch history
  const removeAllHistory = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Vui lòng đăng nhập để xóa tất cả lịch sử xem.');
      navigate('/login');
      return;
    }

    try {
      for (const historyItem of watchHistory) {
        await axios.delete(`http://localhost:8080/api/v1/watch-history/${historyItem.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        });
      }
      setWatchHistory([]);
    } catch (err) {
      console.error('[WatchHistory] Error removing all history:', err);
      let errorMessage = 'Không thể xóa tất cả lịch sử xem. Vui lòng thử lại.';
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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
      <h2 className="text-white text-2xl sm:text-3xl font-normal flex justify-center items-center space-x-3 mb-6">
        <FaHistory />
        <span>Lịch sử xem</span>
      </h2>
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 text-red-400 rounded-lg text-center">
          {error}
        </div>
      )}
      <div className="flex justify-between mb-4">
        <div className="bg-sky-400 text-white text-sm sm:text-base rounded px-4 py-2">
          Bạn đã xem {watchHistory.length} phim gần đây
        </div>
        {watchHistory.length > 0 && (
          <button
            onClick={removeAllHistory}
            className="bg-yellow-400 text-black text-sm sm:text-base rounded px-4 py-2 flex items-center space-x-2 hover:bg-yellow-500"
            type="button"
          >
            <FaTrashAlt />
            <span>Xóa lịch sử xem</span>
          </button>
        )}
      </div>
      <section className="space-y-4">
        {watchHistory.length === 0 ? (
          <div className="text-gray-400 text-center">
            <p className="text-xl">Chưa có tập phim nào trong lịch sử xem.</p>
            <p className="text-sm mt-2">
              Nếu bạn đã xem phim nhưng không thấy lịch sử, hãy kiểm tra email đăng nhập hoặc liên hệ hỗ trợ.
            </p>
          </div>
        ) : (
          watchHistory.map((item) => (
            <article key={item.id} className="bg-[#22272f] p-4 flex space-x-4">
              <img
                alt={`Poster of ${item.title}`}
                className="w-20 h-20 object-cover flex-shrink-0"
                height="80"
                src={item.posterPath}
                width="80"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://picsum.photos/200/300';
                }}
              />
              <div className="flex flex-col justify-center text-sm sm:text-base">
                <p className="text-gray-300 mb-1">
                  Bạn đã xem
                  <span className="text-red-600"> Tập {item.episodeNumber}</span>
                  lúc {new Date(item.watchedAt).toLocaleString('vi-VN')}
                </p>
                <Link
                  to={`/series/tmdb/${item.seriesId}/episode/${item.episodeNumber}`}
                  className="text-sky-400 font-semibold text-lg sm:text-xl hover:underline"
                >
                  {item.title} 
                </Link>
                <div className="mt-1 text-gray-300 flex items-center space-x-1">
                  <FaThumbsUp />
                  <span>Xem tiếp</span>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
};

export default WatchHistory;