import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { API_BASE_URL } from "./Service/Api";
const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const animationFrameId = useRef(null);

  // Gọi API từ backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/banners`);
        if (!response.ok) throw new Error("Failed to fetch banners");
        const data = await response.json();
        setBanners(data.data); 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching banners:", error);
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Hiệu ứng scroll tự động
  useEffect(() => {
    const scroll = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += 1; // Tốc độ scroll
        if (
          scrollRef.current.scrollLeft >=
          scrollRef.current.scrollWidth - scrollRef.current.clientWidth
        ) {
          scrollRef.current.scrollLeft = 0; // Reset về đầu
        }
        animationFrameId.current = requestAnimationFrame(scroll); // Gọi lại frame tiếp theo
      }
    };

    animationFrameId.current = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [loading]);


  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" }); // Di chuyển phải 300px
    }
  };

  if (loading) return <p className="text-center text-gray-400">Đang tải banners...</p>;

  return (
    <div className="relative mx-auto overflow-hidden h-[450px]">
      {/* Nút điều khiển */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10 hover:bg-gray-600"
      >
        <FaArrowLeft />
      </button>
      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full z-10 hover:bg-gray-600"
      >
        <FaArrowRight />
      </button>

      {/* Danh sách banner */}
      <div
        ref={scrollRef}
        className="flex space-x-4 scroll-smooth" // Thêm scroll-smooth cho mượt
        style={{ scrollBehavior: "smooth" }} // Đảm bảo scroll thủ công mượt mà
      >
        {banners.map((banner) => (
          <Link
            to={banner.animationId ? `/animation/${banner.animationId}` : "#"}
            key={banner.id}
          >
            <div className="relative bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 w-[300px] h-[450px] transition-transform duration-300 hover:scale-105">
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">

                {banner.animationId ? "Series" : "N/A"}
              </div>
              <div className="absolute bottom-2 left-2 text-white text-sm font-bold">
                {banner.title}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Banner;