import React, { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import contribAds from 'videojs-contrib-ads'; // Import trực tiếp module
import 'videojs-contrib-ads/dist/videojs.ads.css'; // CSS cho plugin ads
import 'videojs-ima'; // Plugin IMA

const VideoAds = ({ videoUrl, onAdComplete }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;

    // Dispose player nếu đã tồn tại
    if (playerRef.current) {
      playerRef.current.dispose();
    }

    // Đăng ký plugin videojs-contrib-ads nếu chưa có
    if (!videojs.getPlugin('ads')) {
      videojs.registerPlugin('ads', contribAds);
    }

    // Khởi tạo player mới
    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
    });

    // Kiểm tra xem plugin ads đã được đăng ký chưa
    if (!player.ads) {
      console.error('Plugin videojs-contrib-ads không được đăng ký.');
      return;
    }

    // Khởi tạo quảng cáo với videojs-contrib-ads
    player.ads();

    // Cấu hình IMA để phát quảng cáo
    player.ima({
      adTagUrl:
        'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&cust_params=sample_ct%3Dlinear&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator=' +
        new Date().getTime(), // Thêm timestamp để tránh cache
    });

    player.ready(() => {
      // Khởi tạo container quảng cáo trước khi yêu cầu quảng cáo
      player.ima.initializeAdDisplayContainer();

      // Yêu cầu quảng cáo
      player.ima.requestAds();

      // Sự kiện khi quảng cáo sẵn sàng
      player.on('adsready', () => {
        console.log('Quảng cáo sẵn sàng');
        player.ima.start();
      });

      // Sự kiện khi quảng cáo kết thúc
      player.on('adend', () => {
        console.log('Quảng cáo đã kết thúc');
        player.src({
          src: videoUrl,
          type: videoUrl.includes('.mp4') ? 'video/mp4' : 'application/dash+xml',
        });
        player.play();
        if (onAdComplete) onAdComplete();
      });

      // Xử lý lỗi quảng cáo
      player.on('aderror', (e) => {
        console.error('Lỗi quảng cáo:', e);
        // Phát video chính nếu quảng cáo lỗi
        player.src({
          src: videoUrl,
          type: videoUrl.includes('.mp4') ? 'video/mp4' : 'application/dash+xml',
        });
        player.play();
      });
    });

    playerRef.current = player;

    // Cleanup khi component unmount
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
      }
    };
  }, [videoUrl, onAdComplete]);

  return (
    <div data-vjs-player className="w-full">
      <video ref={videoRef} className="video-js vjs-default-skin w-full h-[600px]" />
    </div>
  );
};

export default VideoAds;