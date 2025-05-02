import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaCalendarAlt } from "react-icons/fa";

const Content = () => {
    const [contentList, setContentList] = useState([]);
    const [itemsToShow, setItemsToShow] = useState(18);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const itemsPerPage = 30;

    useEffect(() => {
        let isMounted = true;

        const fetchContentFromBackend = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/series/content?page=1&pageSize=100');
                if (!response.ok) {
                    throw new Error('Không thể lấy danh sách nội dung từ backend');
                }
                const result = await response.json();
                if (isMounted) {
                    if (!Array.isArray(result.data.results)) {
                        throw new Error('Dữ liệu nội dung từ backend không phải là mảng');
                    }
                    
                    const formattedData = result.data.results
                        .map(item => {
                            // Kiểm tra xem item có tmdbId hoặc id hợp lệ không
                            const itemId = item.tmdbId || item.id;
                            if (!itemId || itemId === 'undefined' || itemId === '') {
                                console.warn(`Series missing or invalid ID: ${item.name || 'Unknown'}`, {
                                    id: item.id,
                                    tmdbId: item.tmdbId,
                                    itemData: item,
                                });
                                return null;
                            }
                            return {
                                id: itemId,
                                name: item.name,
                                poster_path: item.posterPath,
                                first_air_date: item.firstAirDate,
                                type: item.customFields?.type || 'Series',
                                vote_average: item.voteAverage,
                                episodeCount: item.customFields?.episodeCount || 0,
                                isUpdated: item.customFields?.isUpdated || false,
                            };
                        })
                        .filter(Boolean);

                    if (formattedData.length === 0) {
                        console.warn('No valid series found in content list. Check backend data.');
                    }

                    setContentList(formattedData);
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        };

        fetchContentFromBackend();

        return () => {
            isMounted = false;
        };
    }, []);

    const sortedContent = [...contentList].sort((a, b) => {
        if (a.type === 'Animation' && b.type !== 'Animation') return -1;
        if (a.type !== 'Animation' && b.type === 'Animation') return 1;
        if (a.type === 'Animation' && b.type === 'Animation') {
            return (b.episodeCount || 0) - (a.episodeCount || 0);
        }
        const dateA = new Date(a.first_air_date || '1970-01-01');
        const dateB = new Date(b.first_air_date || '1970-01-01');
        return dateB - dateA;
    });

    const displayedItems = sortedContent.slice(0, itemsToShow);
    const hasMoreItems = itemsToShow < sortedContent.length;

    const handleLoadMore = () => {
        setItemsToShow((prev) => prev + itemsPerPage);
    };

    if (loading) return <p className="text-gray-400">Đang tải nội dung...</p>;
    if (error) return <p className="text-red-500">Lỗi: {error}</p>;

    return (
        <main className="w-full md:w-4/5">
            <div className="max-w-screen-xl mx-auto p-4">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-green-400">Mới Cập Nhật</h1>
                    <div className="flex items-center">
                        <FaCalendarAlt className="text-white mr-2" />
                        <span className="text-white">Lịch phim</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-6">
                    {displayedItems.map((item) => (
                        <Link
                            to={
                                item.type === 'Series'
                                    ? `/series/tmdb/${item.id}`
                                    : item.type === 'Movie'
                                        ? `/movie/${item.id}`
                                        : `/animation/${item.id}`
                            }
                            key={item.id}
                        >
                            <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                                <div className="relative">
                                    <div
                                        className="group w-full h-64 bg-cover bg-center rounded-t-lg hover:scale-95 transition-all duration-300"
                                        style={{
                                            backgroundImage: `url(${item.poster_path
                                                ? item.poster_path.startsWith('http')
                                                    ? item.poster_path
                                                    : `https://image.tmdb.org/t/p/w300${item.poster_path}`
                                                : 'https://via.placeholder.com/300x400'
                                                })`,
                                        }}
                                    >
                                        {item.type === 'Animation' && item.isUpdated && (
                                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                                Mới
                                            </span>
                                        )}
                                        {item.type === 'Animation' && item.episodeCount > 0 && (
                                            <span className="absolute top-2 right-2 bg-orange-500 text-white text-sm font-bold px-2 py-1 rounded shadow-md">
                                                {item.episodeCount} tập
                                            </span>
                                        )}
                                        <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                                            {item.first_air_date
                                                ? new Date(item.first_air_date).getFullYear()
                                                : 'N/A'}
                                        </span>
                                        <span className="absolute bottom-2 right-2 bg-teal-500 text-white text-xs px-2 py-1 rounded">
                                            {item.type}
                                        </span>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button className="bg-white text-black rounded-full p-4 hover:bg-gray-200 transition">
                                                <FaPlay className="text-xl" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <h2 className="text-sm text-center text-white truncate">
                                        {item.name}
                                    </h2>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="flex justify-center mt-6 space-x-4">
                    {hasMoreItems && (
                        <button
                            className="px-6 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition"
                            onClick={handleLoadMore}
                        >
                            Xem thêm
                        </button>
                    )}
                    <Link to="/all-series">
                        <button className="px-6 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition">
                            Xem toàn bộ
                        </button>
                    </Link>
                </div>
            </div>
        </main>
    );
};

export default Content;