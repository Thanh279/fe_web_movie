import React, { useState, useEffect } from 'react';
import Content from './components/Content';
import Banner from './components/Banner';
import Rankings from './components/pages/Rankings'; // Import Rankings
import { getAllAnimations } from './components/Service/Api';
import './assets/styles/css.css';

const Home = () => {
  const [tvSeries, setTvSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousBackendData, setPreviousBackendData] = useState([]);

  const fetchData = async () => {
    try {
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
        const previousAnimation = previousBackendData.find((prev) => prev.id === animation.id);
        const previousEpisodeCount = previousAnimation?.episodes?.length || 0;
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
      setPreviousBackendData(animationsWithEpisodes);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <p className="text-center text-gray-400 text-lg">Đang tải dữ liệu...</p>;
  if (error) return <p className="text-center text-red-500 text-lg">Lỗi: {error}</p>;

  return (
    <div>
      <div className="mt-20">
        <Banner />
      </div>
      <div className=" mx-auto p-4">
        <div className="flex flex-col md:flex-row">
         
            <Content tvSeries={tvSeries} />
          
          <Rankings className="w-full md:w-1/5 " />
        </div>
      </div>
    </div>
  );
};

export default Home;