import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import * as dashjs from 'dashjs';
import Logo from '../../../assets/img/logo.jpg';

const MovieDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const videoRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [source, setSource] = useState('tmdb'); // Mặc định là TMDB
  const [movieDetails, setMovieDetails] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('Thuyết Minh');

  // Khởi tạo Dash.js cho video DASH
  useEffect(() => {
    if (!videoRef.current || !selectedVideo || !selectedVideo.videoUrl?.includes('/videos/')) return;

    console.log("✅ Khởi tạo Dash.js...");
    const dashPlayer = dashjs.MediaPlayer().create();
    dashPlayer.initialize(videoRef.current, null, false);
    dashPlayer.on(dashjs.MediaPlayer.events.ERROR, (e) => {
      console.error("Lỗi Dash.js:", e);
      setError(`Lỗi phát video: ${e.error.message || 'Không xác định'}`);
    });
    setPlayer(dashPlayer);

    const fullUrl = `http://localhost:8080${selectedVideo.videoUrl}`;
    console.log("🔹 Gán nguồn DASH:", fullUrl);
    dashPlayer.attachSource(fullUrl);

    return () => {
      if (dashPlayer) {
        dashPlayer.reset();
        console.log("Đã hủy Dash.js player");
      }
    };
  }, [videoRef.current, selectedVideo]);

  // Xác định nguồn từ URL
  useEffect(() => {
    if (location.pathname.includes('/movie/backend/')) {
      setSource('backend');
    } else {
      setSource('tmdb');
    }
  }, [location]);

  // Fetch dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (source === 'tmdb') {
          // Lấy thông tin phim từ TMDB
          const detailsResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?language=vi`,
            {
              method: 'GET',
              headers: {
                accept: 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
              },
            }
          );
          if (!detailsResponse.ok) throw new Error('Không thể tải thông tin phim từ TMDB');
          const detailsData = await detailsResponse.json();
          setMovieDetails(detailsData);

          // Lấy video từ TMDB
          const videosResponse = await fetch(
            `https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`,
            {
              method: 'GET',
              headers: {
                accept: 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
              },
            }
          );
          let videosData = { results: [] };
          if (videosResponse.ok) {
            videosData = await videosResponse.json();
          }

          // Kiểm tra backend để lấy dữ liệu bổ sung
          const animationsResponse = await fetch('http://localhost:8080/api/animations');
          if (!animationsResponse.ok) throw new Error('Không thể tải danh sách phim từ backend');
          const animationsData = await animationsResponse.json();
          const matchingAnimation = animationsData.find(
            (animation) => animation.title === detailsData.title
          );

          if (matchingAnimation) {
            const episodesResponse = await fetch(
              `http://localhost:8080/api/animations/${matchingAnimation.id}/episodes`
            );
            if (episodesResponse.ok) {
              const episodesData = await episodesResponse.json();
              setVideos(episodesData);
              if (episodesData.length > 0) {
                setSelectedVideo(episodesData[0]);
              }
            } else {
              setVideos(videosData.results);
              if (videosData.results.length > 0) {
                setSelectedVideo(videosData.results[0]);
              }
            }
          } else {
            setVideos(videosData.results);
            if (videosData.results.length > 0) {
              setSelectedVideo(videosData.results[0]);
            }
          }
        } else if (source === 'backend') {
          // Lấy thông tin phim từ backend
          const animationResponse = await fetch(`http://localhost:8080/api/animations/${id}`);
          if (!animationResponse.ok) throw new Error('Không thể tải thông tin phim từ backend');
          const animationData = await animationResponse.json();
          setMovieDetails(animationData);

          const episodesResponse = await fetch(
            `http://localhost:8080/api/animations/${id}/episodes`
          );
          if (!episodesResponse.ok) throw new Error('Không thể tải tập phim từ backend');
          const episodesData = await episodesResponse.json();
          setVideos(episodesData);
          if (episodesData.length > 0) {
            setSelectedVideo(episodesData[0]);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (source) {
      fetchData();
    }
  }, [source, id]);

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    if (!video.videoUrl) {
      console.error("Không tìm thấy URL video.");
      setError("Không thể phát video. Vui lòng thử lại sau.");
      return;
    }

    console.log("🔹 Video URL:", video.videoUrl);

    if (video.videoUrl.includes('/videos/') && player) {
      const fullUrl = `http://localhost:8080${video.videoUrl}`;
      console.log("🔹 Gán nguồn DASH:", fullUrl);
      try {
        player.attachSource(fullUrl);
      } catch (err) {
        console.error("Lỗi khi gán nguồn DASH:", err);
        setError("Không thể phát video DASH. Vui lòng thử lại sau.");
      }
    }
  };

  const renderVideoPlayer = () => {
    if (error) {
      return <p className="text-red-500 font-semibold">{error}</p>;
    }

    if (!selectedVideo) return null;

    // Google Drive
    if (selectedVideo.videoUrl?.includes('drive.google.com')) {
      const fileIdMatch =
        selectedVideo.videoUrl.match(/\/d\/(.+?)\/view/) ||
        selectedVideo.videoUrl.match(/file\/d\/(.+?)(?:\/|$)/);
      const fileId = fileIdMatch ? fileIdMatch[1] : null;
      const embedUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;

      if (!embedUrl) {
        setError("Không thể phát video từ Google Drive.");
        return null;
      }

      return (
        <iframe
          src={embedUrl}
          width="100%"
          height="500"
          allow="autoplay; fullscreen"
          allowFullScreen
          className=" shadow-2xl"
          title={movieDetails?.title}
        ></iframe>
      );
    }

   
    if (selectedVideo.videoUrl?.includes('/videos/')) {
      return (
        <video
          ref={videoRef}
          controls
          width="100%"
          height="500"
          className=" shadow-2xl"
          style={{ maxWidth: '100%' }}
        ></video>
      );
    }

    
    if (source === 'tmdb' && selectedVideo.key) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${selectedVideo.key}`}
          width="100%"
          height="600"
          allow="autoplay; fullscreen"
          allowFullScreen
          className=" shadow-2xl"
          title={movieDetails?.title}
        ></iframe>
      );
    }

    return <p className="text-gray-500">Không tìm thấy video.</p>;
  };

  if (loading) return <p className="text-center text-gray-400 text-lg">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-center text-red-500 text-lg">Lỗi: {error}</p>;
  if (!movieDetails) return <p className="text-center text-gray-400 text-lg">Không tìm thấy phim</p>;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="w-full py-8 px-4">
        <div className="relative w-full">
          {renderVideoPlayer()}
          <div
            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-full"
            style={{ pointerEvents: 'auto' }}
          >
            <img src={Logo} alt="Logo" className="w-10 h-10 rounded-full" />
          </div>
        </div>

        <div className="mt-8 flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/4">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold text-blue-300 mb-4">
                {movieDetails.title}
              </h1>
              <div className="flex gap-3 mb-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200">
                  Lịch chiếu: Tối Chủ Nhật
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200">
                  + Thêm vào Yêu Thích
                </button>
              </div>
              <p className="text-gray-300 mb-2">
                <span className="font-semibold text-white">Thời lượng:</span>{' '}
                {movieDetails.runtime ? `${movieDetails.runtime} phút` : 'Unknown'} [4K]
              </p>
              <p className="text-gray-300 mb-2">
                <span className="font-semibold text-white">Trạng thái:</span>{' '}
                {movieDetails.status || 'Đang Chiếu'}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {movieDetails.genres?.map((genre) => (
                  <span key={genre.id} className="bg-blue-600 text-white py-1 px-3 rounded-full text-sm">
                    {genre.name}
                  </span>
                )) || (
                  <span className="bg-blue-600 text-white py-1 px-3 rounded-full text-sm">
                    Unknown
                  </span>
                )}
              </div>
              <p className="text-gray-300 mb-2">
                <span className="font-semibold text-white">Năm:</span>{' '}
                {movieDetails.release_date?.slice(0, 4) || movieDetails.releaseYear}
              </p>
              <button className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg mb-4 flex items-center justify-center hover:bg-gray-600 transition-all duration-200">
                <i className="fas fa-comment-alt mr-2"></i> Xem bình luận (785)
              </button>
              <p className="text-gray-300 text-sm leading-relaxed">
                {movieDetails.overview || movieDetails.description || 'Không có mô tả'}
              </p>
            </div>
          </div>

          <div className="w-full lg:w-1/4">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="flex justify-between mb-4">
                <button
                  className={`w-1/2 py-2 rounded-l-lg transition-all duration-300 ${selectedTab === 'Thuyết Minh' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setSelectedTab('Thuyết Minh')}
                >
                  Thuyết Minh
                </button>
                <button
                  className={`w-1/2 py-2 rounded-r-lg transition-all duration-300 ${selectedTab === 'Vietsub' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                  onClick={() => setSelectedTab('Vietsub')}
                >
                  Vietsub
                </button>
              </div>
              <h3 className="text-lg font-semibold text-blue-400 mb-4">
                Video liên quan
              </h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pb-4">
                {videos.map((video) => (
                  <button
                    key={video.id}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${selectedVideo?.id === video.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                    onClick={() => handleSelectVideo(video)}
                  >
                    {video.name || `Video ${video.id}`}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-3 flex-wrap">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200">
                  Fanpage FB
                </button>
                <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-200">
                  Nhóm Zalo
                </button>
                <button className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-200">
                  Nhóm 1
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;