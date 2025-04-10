import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay } from "react-icons/fa";
import { getAllAnimations } from '../../Service/Api'; 

const AllSeries = () => {
  const [tvSeries, setTvSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch TV series from TMDB
        const tvResponse = await fetch(
          'https://api.themoviedb.org/3/discover/tv?include_adult=false&language=vi&page=1&sort_by=popularity.desc',
          {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
            },
          }
        );
        if (!tvResponse.ok) throw new Error('Không thể tải TV Series từ TMDB');
        const tvData = await tvResponse.json();
        const tvResults = tvData.results.map((item) => ({
          ...item,
          type: 'TV',
        }));

        // Fetch movies from TMDB
        const movieResponse = await fetch(
          'https://api.themoviedb.org/3/discover/movie?include_adult=false&language=vi&page=1&sort_by=popularity.desc',
          {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
            },
          }
        );
        if (!movieResponse.ok) throw new Error('Không thể tải Movies từ TMDB');
        const movieData = await movieResponse.json();
        const movieResults = movieData.results.map((item) => ({
          ...item,
          type: 'Movie',
        }));

        const combinedTmdbData = [...tvResults, ...movieResults];
        const fixedTmdbData = combinedTmdbData.slice(0, 20);

        // Fetch animations from your backend
        const backendData = await getAllAnimations();

        const animationsWithEpisodes = await Promise.all(
          backendData.map(async (animation) => {
            const episodesResponse = await fetch(
              `http://localhost:8080/api/animations/${animation.id}/episodes`
            );
            const episodes = episodesResponse.ok ? await episodesResponse.json() : [];
            return { ...animation, episodes, type: 'Animation' };
          })
        );

        const formattedBackendData = animationsWithEpisodes.map((animation) => {
          const previousEpisodeCount = 0; // We don't need previousBackendData in AllSeries
          const currentEpisodeCount = animation.episodes.length;
          const isUpdated = currentEpisodeCount > previousEpisodeCount;

          return {
            id: animation.id,
            name: animation.title,
            poster_path: animation.imgUrl,
            first_air_date: animation.releaseYear ? `${animation.releaseYear}-01-01` : 'N/A',
            videoUrl: animation.episodes[0]?.videoUrl || null,
            episodeCount: currentEpisodeCount,
            isUpdated,
            type: animation.type,
          };
        });

        const sortedBackendData = formattedBackendData.sort((a, b) => {
          if (a.isUpdated && !b.isUpdated) return -1;
          if (!a.isUpdated && b.isUpdated) return 1;
          return b.episodeCount - a.episodeCount;
        });

        const combinedData = [
          ...sortedBackendData,
          ...fixedTmdbData.filter(
            (tmdbItem) =>
              !sortedBackendData.some((backendItem) => backendItem.name === (tmdbItem.name || tmdbItem.title))
          ),
        ];

        setTvSeries(combinedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-center text-gray-400 text-lg">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-center text-red-500 text-lg">Lỗi: {error}</p>;
  if (!tvSeries || !Array.isArray(tvSeries) || tvSeries.length === 0) {
    return <p className="text-center text-gray-400 text-lg">Không có dữ liệu để hiển thị</p>;
  }

  return (
    <main>
      <div className="max-w-screen-xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-green-400 mb-4">Tất Cả Phim</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-6">
          {tvSeries.map((series) => (
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
      </div>
    </main>
  );
};

export default AllSeries;