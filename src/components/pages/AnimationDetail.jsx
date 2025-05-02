import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import * as dashjs from 'dashjs';
import Logo from '../../assets/img/logo.jpg';

const AnimationDetail = () => {
  const { id } = useParams();
  const videoRef = useRef(null);
  const [player, setPlayer] = useState(null);
  const [seriesDetails, setSeriesDetails] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  useEffect(() => {
    if (!videoRef.current || !selectedVideo || !selectedVideo.videoUrl?.includes('/phim/')) return;

    console.log("Khởi tạo Dash.js...");
    const dashPlayer = dashjs.MediaPlayer().create();
    dashPlayer.initialize(videoRef.current, null, false);
    dashPlayer.on(dashjs.MediaPlayer.events.ERROR, (e) => {
      console.error("Lỗi Dash.js:", e);
      setError(`Lỗi phát video: ${e.error.message || 'Không xác định'}`);
    });
    setPlayer(dashPlayer);

    const fullUrl = `http://localhost:8080${selectedVideo.videoUrl}`;
    console.log("Gán nguồn DASH:", fullUrl);
    dashPlayer.attachSource(fullUrl);

    return () => {
      if (dashPlayer) {
        dashPlayer.reset();
        console.log("Đã hủy Dash.js player");
      }
    };
  }, [selectedVideo]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
  
      try {
        const animationResponse = await fetch(`http://localhost:8080/api/animations/${id}`);
        if (!animationResponse.ok) throw new Error('Không thể tải thông tin phim từ backend');
        const animationData = await animationResponse.json();
        console.log(animationData.data);
        setSeriesDetails(animationData.data);
  
        const episodesResponse = await fetch(`http://localhost:8080/api/animations/${id}/episodes`);
        if (!episodesResponse.ok) throw new Error('Không thể tải tập phim từ backend');
        const episodesData = await episodesResponse.json();
        if (Array.isArray(episodesData.data)) {
          setVideos(episodesData.data); 
        } else {
          console.error('Dữ liệu tập phim không phải là mảng');
        }
  
        if (episodesData.data && episodesData.data.length > 0) {
          setSelectedVideo(episodesData.data[0]);
          setSelectedEpisode(episodesData.data[0].episodeNumber.toString());
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);
  

  const handleSelectVideo = (video) => {
    setSelectedVideo(video);
    setSelectedEpisode(video.episodeNumber.toString());

    if (!video.videoUrl) {
      console.error("Không tìm thấy URL video.");
      setError("Không thể phát video. Vui lòng thử lại sau.");
      return;
    }

    console.log("Video URL:", video.videoUrl);

    if (video.videoUrl.includes('/phim/') && player) {
      const fullUrl = `http://localhost:8080${video.videoUrl}`;
      console.log("Gán nguồn DASH:", fullUrl);
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

    if (selectedVideo.videoUrl?.includes('drive.google.com')) {
      const fileIdMatch =
        selectedVideo.videoUrl.match(/\/d\/(.+?)\/view/) ||
        selectedVideo.videoUrl.match(/file\/d\/(.+?)(?:\/|$)/);
      const fileId = fileIdMatch ? fileIdMatch[1] : null;
      const embedUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview?title=0` : null;

      if (!embedUrl) {
        setError("Không thể phát video từ Google Drive.");
        return null;
      }

      return (
        <iframe
          src={embedUrl}
          width="100%"
          height="600"
          allow="autoplay;encrypted-media"
          allowFullScreen
          className="shadow-2xl"
          title={seriesDetails?.title}
        />
      );
    }

    if (selectedVideo.videoUrl?.includes('/phim/')) {
      return (
        <video
          ref={videoRef}
          controls
          width="100%"
          height="600"
          className="shadow-2xl"
          style={{ maxWidth: '100%' }}
        />
      );
    }

    return <p className="text-red-500">Định dạng video không được hỗ trợ.</p>;
  };

  if (loading) return <p className="text-center text-gray-400 text-lg">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-center text-red-500 text-lg">Lỗi: {error}</p>;
  if (!seriesDetails) return <p className="text-center text-gray-400 text-lg">Không tìm thấy phim</p>;

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="w-full py-8 px-4 flex gap-8">
        <div className="w-1/4 bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">Chọn Tập</h3>
          <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            {Array.isArray(videos) && videos.length > 0 ? (
              videos.map((video) => (
                <button
                  key={video.id}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedEpisode === video.episodeNumber.toString()
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  onClick={() => handleSelectVideo(video)}
                >
                  {video.title}
                </button>
              ))
            ) : (
              <p className="text-gray-400">Không có tập phim.</p>
            )}
          </div>

        </div>

        <div className="w-2/4 flex flex-col items-center">
          <div className="relative w-full">
            {renderVideoPlayer()}
            <div className="absolute top-1 right-2 w-13 h-13 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-full">
              <img src={Logo} alt="Logo" className="w-16 h-16 rounded-full" />
            </div>
          </div>
        </div>

        <div className="w-1/4 bg-gray-800 p-6 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-blue-300 mb-4">{seriesDetails.title}</h1>
          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-white">Thời lượng:</span> {videos.length} tập
          </p>
          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-white">Trạng thái:</span> Đang Chiếu
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {seriesDetails.genres?.map((genre) => (
              <span key={genre.id} className="bg-blue-600 text-white py-1 px-3 rounded-full text-sm">
                {genre.name}
              </span>
            ))}
          </div>
          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-white">Năm:</span> {seriesDetails.releaseYear}
          </p>
          <button className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg mb-4 flex items-center justify-center hover:bg-gray-600 transition-all duration-200">
            <i className="fas fa-comment-alt mr-2"></i> Xem bình luận (785)
          </button>
          <p className="text-gray-300 text-sm leading-relaxed">
            {seriesDetails.description || 'Không có mô tả'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnimationDetail;