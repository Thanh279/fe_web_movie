import React, { useState, useEffect } from 'react';

const GenreList = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Gọi API danh sách thể loại từ TMDB
    useEffect(() => {
        const fetchGenres = async () => {
            const url = 'https://api.themoviedb.org/3/genre/movie/list?language=vi';
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`, // API Key từ .env
                },
            };

            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error('Không thể tải danh sách thể loại từ TMDB');
                }
                const data = await response.json();
                setGenres(data.genres); // Lưu danh sách thể loại vào state
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchGenres();
    }, []);

    // Xử lý trạng thái giao diện
    if (loading) return <p className="text-center text-gray-400 text-lg">Đang tải dữ liệu...</p>;
    if (error) return <p className="text-center text-red-500 text-lg">Lỗi: {error}</p>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-green-400 mb-6 text-center">
                    Danh Sách Thể Loại Phim
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {genres.map((genre) => (
                        <div
                            key={genre.id}
                            className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
                        >
                            <h2 className="text-lg font-semibold text-white">{genre.name}</h2>
                          
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GenreList;