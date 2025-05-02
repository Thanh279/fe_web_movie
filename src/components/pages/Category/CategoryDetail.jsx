import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Rankings from '../Rankings';

const CategoryDetail = () => {
  const { id } = useParams(); // id là tmdbGenreId (ví dụ: 18)
  const [genre, setGenre] = useState(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchGenreAndSeries = async () => {
      try {
        // 1. Lấy thông tin thể loại theo tmdbGenreId
        const genreResponse = await fetch(`http://localhost:8080/api/genres/by-tmdb/${id}`);
        if (!genreResponse.ok) {
          throw new Error('Không thể lấy thông tin thể loại từ backend');
        }
        const genreData = await genreResponse.json();
        if (isMounted) {
          setGenre(genreData.data.data || { tmdbGenreId: id, name: 'Thể loại không xác định' });
        }

        // 2. Lấy danh sách phim từ backend
        const seriesResponse = await fetch('http://localhost:8080/api/series');
        if (!seriesResponse.ok) {
          throw new Error('Không thể lấy danh sách series từ backend');
        }
        const result = await seriesResponse.json();
        if (isMounted) {
          const seriesData = result.data || [];
          if (!Array.isArray(seriesData)) {
            throw new Error('Dữ liệu series từ backend không phải là mảng');
          }
          // Lọc các series thuộc thể loại được chọn
          const filteredSeries = seriesData
            .filter((series) => {
              try {
                const genreIds = JSON.parse(series.genreIds);
                return genreIds.includes(parseInt(id));
              // eslint-disable-next-line no-unused-vars
              } catch (e) {
                console.error('Lỗi parse genreIds:', series.title, series.genreIds);
                return false;
              }
            })
            .map((series) => ({
              id: series.tmdbId,
              title: series.title,
              posterPath: `https://image.tmdb.org/t/p/w200${series.posterPath}`,
              voteAverage: series.voteAverage,
              firstAirDate: series.firstAirDate,
            }));

          setSeries(filteredSeries);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchGenreAndSeries();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <p className="text-center text-gray-400 text-lg">Đang tải...</p>;
  }
  if (error) {
    return <p className="text-center text-red-500 text-lg">Lỗi: {error}</p>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white mt-20">
      <div className="mx-auto p-4">
        <div className="flex flex-col md:flex-row">
          <main className="w-full md:w-4/5">
            <div className="max-w-4xl mx-auto p-4">
              <h1 className="text-2xl font-bold text-green-400 mb-6">
                Thể loại: {genre.name || 'Không xác định'}
              </h1>
              {series.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-6">
                  {series.map((series) => (
                    <Link to={`/series/tmdb/${series.id}`} key={series.id}>
                      <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                        <div className="relative">
                          <div
                            className="group w-full h-64 bg-cover bg-center rounded-t-lg hover:scale-95 transition-all duration-300"
                            style={{
                              backgroundImage: `url(${series.posterPath})`,
                            }}
                          >
                            <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                              {series.firstAirDate
                                ? new Date(series.firstAirDate).getFullYear()
                                : 'N/A'}
                            </span>
                            <span className="absolute bottom-2 right-2 bg-teal-500 text-white text-xs px-2 py-1 rounded">
                              Series
                            </span>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button className="bg-white text-black rounded-full p-4 hover:bg-gray-200 transition">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          <h2 className="text-sm text-center text-white truncate">
                            {series.title}
                          </h2>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400">
                  Hiện tại không có phim thuộc thể loại "{genre?.name}" trong danh sách top rated.{' '}
                  <Link to="/rankings" className="text-green-400 hover:underline">
                    Xem bảng xếp hạng
                  </Link>{' '}
                  để khám phá thêm!
                </p>
              )}
            </div>
          </main>
          <Rankings className="w-full md:w-1/5" />
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;