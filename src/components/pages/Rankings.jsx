
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 

const Rankings = () => {
  const  [topRatedSeries, setTopRatedSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchTopRatedSeries = async () => {
      const url = 'https://api.themoviedb.org/3/tv/top_rated?language=vi&page=1';
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
        },
      };

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error('Không thể tải danh sách top rated từ TMDB');
        }
        const data = await response.json();
       
        const topFive = data.results.slice(0, 8).map((series, index) => ({
          rank: index + 1,
          title: series.name,
          label: `${series.vote_average}/10 [${series.first_air_date.slice(0, 8)}]`,
          image: `https://image.tmdb.org/t/p/w200${series.poster_path}`,
          id: series.id, 
        }));

        setTopRatedSeries(topFive);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTopRatedSeries();
  }, []);

  if (loading) return <p className="text-gray-400">Đang tải bảng xếp hạng...</p>;
  if (error) return <p className="text-red-500">Lỗi: {error}</p>;

  return (
    <div className="w-full md:w-1/4 mt-4 md:mt-0 md:ml-4">
      <h2 className="text-2xl font-bold text-green-400 mb-4 mt-5">Bảng Xếp Hạng</h2>
      <ul>
        {topRatedSeries.map((series) => (
          <li key={series.rank} className="flex items-center mb-4">
            <Link to={`/series/tmdb/${series.id}`} className="flex items-center w-full">
              <span className="text-2xl font-bold text-white mr-2">{series.rank}</span>
              <img
                src={series.image}
                alt={series.title}
                className="rounded-lg mr-2"
                height="75"
                width="50"
              />
              <div>
                <h3 className="text-sm text-white hover:text-green-400 transition-colors">
                  {series.title}
                </h3>
                <span className="text-xs text-gray-400">{series.label}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Rankings;