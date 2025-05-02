/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import * as dashjs from 'dashjs';
import Logo from '../../../assets/img/logo.jpg';
import Comment from '../../Service/Comment';
import SeriesService from '../../Service/ApiService/SeriesService';

const SeriesDetail = () => {
  const { id, episodeNumber } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [source, setSource] = useState('tmdb');
  const [seriesDetails, setSeriesDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchHistoryError, setWatchHistoryError] = useState(null);
  const [favoriteError, setFavoriteError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showAdOverlay, setShowAdOverlay] = useState(true); // State để kiểm soát overlay quảng cáo
  const videoRef = useRef(null);
  const lastAddedEpisodeRef = useRef(null);
  const lastAdClickTime = useRef(0); // Lưu thời gian nhấp cuối cùng

  // Validate ID
  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Mã phim không hợp lệ. Vui lòng quay lại trang trước.');
      setLoading(false);
    }
  }, [id]);

  // Initialize selected episode based on URL episodeNumber
  useEffect(() => {
    if (episodes.length > 0 && episodeNumber) {
      const epNum = parseInt(episodeNumber, 10);
      const episode = episodes.find((ep) => ep.episode_number === epNum);
      if (episode) {
        setSelectedEpisode(episode);
      } else {
        setSelectedEpisode(episodes[0]);
        navigate(`/series/tmdb/${id}/episode/${episodes[0].episode_number}`, { replace: true });
      }
    } else if (episodes.length > 0 && !episodeNumber) {
      setSelectedEpisode(episodes[0]);
      navigate(`/series/tmdb/${id}/episode/${episodes[0].episode_number}`, { replace: true });
    }
  }, [episodes, episodeNumber, id, navigate]);

  // Check if the series is already in favorites
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const isFavorite = await SeriesService.checkFavoriteStatus(id, accessToken);
      setIsFavorite(isFavorite);
    };

    if (id && id !== 'undefined') {
      checkFavoriteStatus();
    }
  }, [id]);

  // Set source based on URL
  useEffect(() => {
    setSource(pathname.includes('/series/tmdb/') ? 'tmdb' : 'tmdb');
  }, [pathname]);

  // Add to watch history
  useEffect(() => {
    if (!seriesDetails || !selectedEpisode || isAdding) return;

    const episodeKey = `${seriesDetails.id}-${seasonNumber}-${selectedEpisode.episode_number}`;
    if (lastAddedEpisodeRef.current === episodeKey) return;

    const addToWatchHistory = async () => {
      setIsAdding(true);
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setWatchHistoryError('Vui lòng đăng nhập để thêm vào lịch sử xem.');
        navigate('/login');
        setIsAdding(false);
        return;
      }

      try {
        await SeriesService.addToWatchHistory(seriesDetails, seasonNumber, selectedEpisode, accessToken);
        lastAddedEpisodeRef.current = episodeKey;
      } catch (err) {
        setWatchHistoryError(err.message);
        if (err.message.includes('Phiên đăng nhập hết hạn')) {
          localStorage.clear();
          navigate('/login');
        }
      } finally {
        setIsAdding(false);
      }
    };

    addToWatchHistory();
  }, [seriesDetails, selectedEpisode, seasonNumber, navigate]);

  // Handle adding/removing from favorites
  const toggleFavorite = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setFavoriteError('Vui lòng đăng nhập để quản lý danh sách yêu thích.');
      navigate('/login');
      return;
    }

    try {
      const newFavoriteStatus = await SeriesService.toggleFavorite(id, seriesDetails, isFavorite, accessToken);
      setIsFavorite(newFavoriteStatus);
      setFavoriteError(null);
    } catch (err) {
      setFavoriteError(err.message);
      if (err.message.includes('Phiên đăng nhập hết hạn')) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  // Fetch series data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (source !== 'tmdb') return;

      const detailsData = await SeriesService.fetchSeriesDetails(id);
      setSeriesDetails(detailsData);

      let formattedEpisodes = await SeriesService.fetchEpisodesFromTMDB(id, seasonNumber);

      if (!formattedEpisodes.length) {
        formattedEpisodes = Array.from(
          { length: detailsData.number_of_episodes || 16 },
          (_, i) => ({
            id: `fallback-${i + 1}`,
            name: `Tập ${i + 1}`,
            episode_number: i + 1,
            overview: 'Không có mô tả',
            air_date: detailsData.first_air_date
              ? new Date(new Date(detailsData.first_air_date).getTime() + i * 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0]
              : `2025-03-${String(i + 7).padStart(2, '0')}`,
            still_path: 'https://picsum.photos/300/169',
            video_key: null,
            isUpdated: i >= (detailsData.number_of_episodes || 16) - 4,
          })
        );
      }

      const backendEpisodes = await SeriesService.fetchEpisodesFromBackend(id);

      const updatedEpisodes = formattedEpisodes.map((ep) => {
        const backendEp = backendEpisodes.find((be) => be.episodeNumber === ep.episode_number);
        return backendEp ? { ...ep, video_key: backendEp.videoUrl } : ep;
      });
      setEpisodes(updatedEpisodes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [source, id, seasonNumber]);

  useEffect(() => {
    if (id && id !== 'undefined' && source) {
      fetchData();
    }
  }, [source, fetchData, id]);

  useEffect(() => {
    if (!selectedEpisode?.video_key || !videoRef.current || !dashjs?.MediaPlayer) {
      if (!dashjs?.MediaPlayer) {
        console.error('Dash.js MediaPlayer is undefined');
        setError('Trình phát video Dash.js không khả dụng');
      }
      return;
    }

    const encodedUrl = encodeURI(`http://localhost:8080${selectedEpisode.video_key}`);
    try {
      const player = dashjs.MediaPlayer().create();
      player.initialize(videoRef.current, encodedUrl, true);
      player.on(dashjs.MediaPlayer.events.ERROR, (e) => {
        console.error('Dash.js Error:', e);
        setError(`Không thể phát video: ${e.error.message}`);
      });

      return () => {
        player.reset();
      };
    } catch (err) {
      console.error('Dash.js Initialization Error:', err);
      setError('Không thể khởi tạo trình phát video: ' + err.message);
    }
  }, [selectedEpisode]);

  // Tự động ẩn overlay quảng cáo sau 3 giây
  useEffect(() => {
    if (showAdOverlay) {
      const timer = setTimeout(() => {
        setShowAdOverlay(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showAdOverlay]);

 
  useEffect(() => {
    if (showAdOverlay) return;

    const timer = setInterval(() => {
      const currentTime = Date.now();
      if (currentTime - lastAdClickTime.current >= 10 * 60 * 1000) {
        setShowAdOverlay(true); 
      }
    }, 1000);

    return () => clearInterval(timer); 
  }, [showAdOverlay]);

  const handleSelectEpisode = useCallback(
    (episode) => {
      setSelectedEpisode(episode);
      setShowAdOverlay(true); 
      navigate(`/series/tmdb/${id}/episode/${episode.episode_number}`);
    },
    [id, navigate]
  );

  const renderVideoPlayer = useCallback(() => {
    if (error) {
      return <p className="text-red-500 font-semibold">{error}</p>;
    }

    if (!selectedEpisode) {
      return <p className="text-gray-500">Vui lòng chọn một tập để xem.</p>;
    }

    if (selectedEpisode.video_key) {
      return (
        <video
          ref={videoRef}
          controls
          width="100%"
          height="600"
          className="shadow-2xl"
          title={selectedEpisode.name}
        />
      );
    }

    if (trailerKey) {
      return (
        <div className="w-full h-[600px] shadow-2xl">
          <iframe
            width="100%"
            height="600"
            src={`https://www.youtube.com/embed/${trailerKey}`}
            title="Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className="w-full h-[600px] bg-gray-700 flex items-center justify-center">
        <p className="text-gray-300">
          Video chưa khả dụng cho tập {selectedEpisode.episode_number}. Xem trên{' '}
          <a href="https://www.netflix.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
            Netflix
          </a>{' '}
          hoặc{' '}
          <a href="https://motchill.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
            Motchill
          </a>.
        </p>
      </div>
    );
  }, [error, selectedEpisode, trailerKey]);

  if (loading) return <p className="text-center text-gray-400 text-lg">Đang tải dữ liệu...</p>;
  if (error) return (
    <div className="text-center text-red-500 text-lg">
      <p>{error}</p>
      <button
        onClick={() => navigate(-1)}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Quay lại
      </button>
    </div>
  );
  if (!seriesDetails) return <p className="text-center text-gray-400 text-lg">Không tìm thấy phim</p>;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="w-full py-8 px-4 flex gap-8">
        {/* Left Column: Episode Selection */}
        <div className="w-1/4 bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">Chọn Tập</h3>
          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {episodes.length > 0 ? (
              episodes.map((episode) => (
                <button
                  key={episode.id}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 text-left flex justify-between items-center ${
                    selectedEpisode?.id === episode.id ? 'bg-blue-500 text-white' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => handleSelectEpisode(episode)}
                >
                  <span>{episode.name}</span>
                  {episode.isUpdated && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Mới</span>
                  )}
                </button>
              ))
            ) : (
              <p className="text-gray-400">
                Không có tập nào khả dụng. Vui lòng xem trên{' '}
                <a href="https://www.netflix.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                  Netflix
                </a>{' '}
                hoặc{' '}
                <a href="https://motchill.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                  Motchill
                </a>.
              </p>
            )}
          </div>
        </div>

        {/* Center Column: Video Player */}
        <div className="w-2/4 flex flex-col items-center">
          {watchHistoryError && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded w-full">
              {watchHistoryError}
            </div>
          )}
          {favoriteError && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded w-full">
              {favoriteError}
            </div>
          )}
          <div className="relative w-full">
            {renderVideoPlayer()}
            {/* Overlay Quảng Cáo */}
            {showAdOverlay && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="relative w-full h-[600px] flex items-center justify-center">
                  <a
                    href="https://shopee.vn" // Liên kết quảng cáo đến Shopee
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-full flex items-center justify-center"
                    onClick={() => {
                      lastAdClickTime.current = Date.now(); // Cập nhật thời gian nhấp
                    }}
                  >
                  </a>
                  <button
                    onClick={() => {
                      setShowAdOverlay(false);
                      lastAdClickTime.current = Date.now(); // Cập nhật thời gian nhấp khi đóng
                    }}
                    className="absolute top-4 right-4 bg-gray-900 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-700"
                  >
                    X
                  </button>
                </div>
              </div>
            )}
            <div className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-full">
              <img src={Logo} alt="Logo" className="w-10 h-10 rounded-full" />
            </div>
          </div>
        </div>

        <div className="w-1/4 bg-gray-800 p-6 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-blue-300 mb-4">{seriesDetails.name || seriesDetails.title}</h1>
          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-white">Thời lượng:</span>{' '}
            {episodes.length}/{seriesDetails.number_of_episodes || 'Đang cập nhật'} tập
          </p>
          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-white">Trạng thái:</span>{' '}
            {seriesDetails.status === 'Ended' ? 'Hoàn tất' : 'Đang phát sóng'}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {(seriesDetails.genres || []).length > 0 ? (
              seriesDetails.genres.map((genre) => (
                <Link to={`/category/${genre.id}`} key={genre.id}>
                  <span className="bg-blue-600 text-white py-1 px-3 rounded-full text-sm hover:bg-blue-700 transition">
                    {genre.name}
                  </span>
                </Link>
              ))
            ) : (
              <Link to="/category/10749">
                <span className="bg-blue-600 text-white py-1 px-3 rounded-full text-sm hover:bg-blue-700 transition">
                  Tình Cảm, Lãng Mạn
                </span>
              </Link>
            )}
          </div>
          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-white">Năm:</span>{' '}
            {seriesDetails.first_air_date?.slice(0, 4) || 'Đang cập nhật'}
          </p>
          <button
            onClick={toggleFavorite}
            className={`w-full mb-4 px-4 py-2 rounded-lg transition-all duration-200 ${
              isFavorite ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isFavorite ? 'Xóa khỏi Yêu Thích' : 'Thêm vào Yêu Thích'}
          </button>
          <Link to={`/series/tmdb/${id}/comments`}>
            <button className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg mb-4 flex items-center justify-center hover:bg-gray-600 transition-all duration-200">
              <i className="fas fa-comment-alt mr-2"></i> Xem bình luận ({seriesDetails.vote_count || 0})
            </button>
          </Link>
          <p className="text-gray-300 text-sm leading-relaxed">
            {seriesDetails.overview || 'Không có mô tả cho series này.'}
          </p>
        </div>
      </div>

      {/* Comments Section Below */}
      <div className="w-full px-4 mt-8">
        <Comment />
      </div>
    </div>
  );
};

export default SeriesDetail;