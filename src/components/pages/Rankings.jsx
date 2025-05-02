import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Rankings = () => {
  const [topRatedSeries, setTopRatedSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSeriesFromBackend = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/series');
        if (!response.ok) {
          throw new Error('Không thể lấy danh sách series từ backend');
        }
        const result = await response.json();
        if (isMounted) {
          const seriesData = result.data || [];
          if (!Array.isArray(seriesData)) {
            throw new Error('Dữ liệu series từ backend không phải là mảng');
          }
          const topRated = seriesData.slice(0, 10).map((series, index) => ({
            rank: index + 1,
            title: series.title,
            label: `${series.voteAverage}/10 [${series.firstAirDate.slice(0, 10)}]`,
            image: `https://image.tmdb.org/t/p/w200${series.posterPath}`,
            id: series.tmdbId,
          }));
          setTopRatedSeries(topRated);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchSeriesFromBackend();

    return () => {
      isMounted = false;
    };
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