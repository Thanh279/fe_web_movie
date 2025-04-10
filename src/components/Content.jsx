import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaCalendarAlt } from "react-icons/fa";

const Content = ({ tvSeries }) => {
  const [itemsToShow, setItemsToShow] = useState(18);
  const itemsPerPage = 18;

  const displayedTvSeries = tvSeries.slice(0, itemsToShow);
  const hasMoreItems = itemsToShow < tvSeries.length;

  const handleLoadMore = () => {
    setItemsToShow((prev) => prev + itemsPerPage);
  };

  return (
    <main>
      <div className="max-w-screen-xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-green-400">Mới Cập Nhật</h1>
          <div className="flex items-center">
            <FaCalendarAlt className="text-white mr-2" />
            <span className="text-white">Lịch phim</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-6">
          {displayedTvSeries.map((series) => (
            <Link
              to={
                series.type === 'TV'
                  ? `/series/tmdb/${series.id}`
                  : series.type === 'Movie'
                  ? `/movie/${series.id}`
                  : `/animation/${series.id}`
              }
              key={series.id}
            >
              <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                <div className="relative">
                  <div
                    className="group w-full h-64 bg-cover bg-center rounded-t-lg hover:scale-95 transition-all duration-300"
                    style={{
                      backgroundImage: `url(${
                        series.type === 'Animation'
                          ? series.poster_path || 'https://via.placeholder.com/300x400'
                          : series.poster_path
                          ? `https://image.tmdb.org/t/p/w300${series.poster_path}`
                          : 'https://via.placeholder.com/300x400'
                      })`,
                    }}
                  >
                    {series.type === 'Animation' && series.isUpdated && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Mới
                      </span>
                    )}
                    {series.type === 'Animation' && series.episodeCount > 0 && (
                      <span className="absolute top-2 right-2 bg-orange-500 text-white text-sm font-bold px-2 py-1 rounded shadow-md">
                        {series.episodeCount} tập
                      </span>
                    )}
                    <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      {series.first_air_date || series.release_date
                        ? new Date(series.first_air_date || series.release_date).getFullYear()
                        : 'N/A'}
                    </span>
                    <span className="absolute bottom-2 right-2 bg-teal-500 text-white text-xs px-2 py-1 rounded">
                      {series.type === 'TV' || series.type === 'Series'
                        ? 'Series'
                        : series.type === 'Movie'
                        ? 'Movie'
                        : 'Animation'}
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="bg-white text-black rounded-full p-4 hover:bg-gray-200 transition">
                        <FaPlay className="text-xl" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <h2 className="text-sm text-center text-white truncate">{series.name || series.title}</h2>
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