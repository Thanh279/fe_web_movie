import axios from 'axios';

const SeriesService = {
  // Fetch series details from TMDB
  fetchSeriesDetails: async (seriesId) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${seriesId}?language=vi`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`TMDB details fetch failed: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      throw new Error(err.message);
    }
  },

  // Fetch episodes for a specific season from TMDB
  fetchEpisodesFromTMDB: async (seriesId, seasonNumber) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?language=vi`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
          },
        }
      );
      if (response.ok) {
        const episodesData = await response.json();
        if (episodesData.episodes?.length > 0) {
          return episodesData.episodes
            .map((ep) => ({
              id: ep.id,
              name: ep.name || `Tập ${ep.episode_number}`,
              episode_number: ep.episode_number,
              overview: ep.overview || 'Không có mô tả',
              air_date: ep.air_date,
              still_path: ep.still_path
                ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                : 'https://picsum.photos/300/169',
              video_key: null,
              isUpdated: ep.air_date && new Date(ep.air_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            }))
            .sort((a, b) => a.episode_number - b.episode_number);
        }
        return [];
      } else {
        console.warn('TMDB episodes fetch failed:', response.status);
        return [];
      }
    } catch (err) {
      console.warn('Error fetching episodes from TMDB:', err);
      return [];
    }
  },

  // Fetch episodes from backend
  fetchEpisodesFromBackend: async (seriesId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/series/${seriesId}/episodes`);
      if (response.ok) {
        const data = await response.json();
        return data.data || data;
      } else {
        console.warn('Backend fetch failed:', response.status);
        return [];
      }
    } catch (err) {
      console.warn('Backend fetch error:', err);
      return [];
    }
  },

  // Check if series is in favorites
  checkFavoriteStatus: async (seriesId, accessToken) => {
    try {
      const response = await axios.get('http://localhost:8080/api/v1/favorites', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        withCredentials: true,
      });

      const favorites = response.data?.data?.data || [];
      return favorites.some((fav) => fav.seriesId === seriesId.toString());
    } catch (err) {
      console.error('[SeriesService] Error checking favorite status:', err);
      return false;
    }
  },

  // Add or remove from favorites
  toggleFavorite: async (seriesId, seriesDetails, isFavorite, accessToken) => {
    const favoriteData = {
      seriesId: seriesId ? seriesId.toString() : '',
      title: seriesDetails?.name || seriesDetails?.title || 'Không có tiêu đề',
      posterPath: seriesDetails?.poster_path
        ? `https://image.tmdb.org/t/p/w300${seriesDetails.poster_path}`
        : 'https://picsum.photos/200/300',
    };

    if (!favoriteData.seriesId || favoriteData.seriesId === '') {
      throw new Error('Không thể thêm vào yêu thích: Mã series không hợp lệ.');
    }
    if (!favoriteData.title || favoriteData.title === 'Không có tiêu đề') {
      console.warn('[SeriesService] Title is missing or invalid, using default:', favoriteData.title);
    }

    console.debug('[SeriesService] Sending favorite data:', favoriteData);

    try {
      if (isFavorite) {
        const response = await axios.get('http://localhost:8080/api/v1/favorites', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        });

        const favorites = response.data?.data?.data || [];
        const favoriteToRemove = favorites.find((fav) => fav.seriesId === seriesId.toString());
        if (favoriteToRemove) {
          await axios.delete(`http://localhost:8080/api/v1/favorites/${favoriteToRemove.id}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          });
          return false; // Removed from favorites
        }
      } else {
        const response = await axios.post(
          'http://localhost:8080/api/v1/favorites',
          favoriteData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );
        console.debug('[SeriesService] Add to favorites response:', response.data);
        return true; // Added to favorites
      }
    } catch (err) {
      console.error('[SeriesService] Error toggling favorite:', err);
      let errorMessage = 'Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.';
      if (err.response?.status === 400) {
        errorMessage = `Yêu cầu không hợp lệ: ${err.response?.data?.message || 'Dữ liệu gửi lên không đúng định dạng.'}`;
      } else if (err.response?.status === 403) {
        errorMessage = 'Bạn không có quyền cập nhật danh sách yêu thích.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      }
      throw new Error(errorMessage);
    }
  },

  // Add to watch history
  addToWatchHistory: async (seriesDetails, seasonNumber, selectedEpisode, accessToken) => {
    try {
      await axios.post(
        'http://localhost:8080/api/v1/watch-history',
        {
          seriesId: seriesDetails.id.toString(),
          title: seriesDetails.name || seriesDetails.title || 'Không có tiêu đề',
          seasonNumber: seasonNumber > 0 ? seasonNumber : 1,
          episodeNumber: selectedEpisode.episode_number > 0 ? selectedEpisode.episode_number : 1,
          posterPath: seriesDetails.poster_path
            ? `https://image.tmdb.org/t/p/w300${seriesDetails.poster_path}`
            : 'https://picsum.photos/200/300',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );
      console.debug('[SeriesService] Đã thêm vào lịch sử xem:', `${seriesDetails.id}-${seasonNumber}-${selectedEpisode.episode_number}`);
    } catch (err) {
      console.error('[SeriesService] Thất bại khi thêm vào lịch sử xem:', err);
      let errorMessage = 'Không thể thêm series vào lịch sử xem. Vui lòng thử lại.';
      if (err.response?.status === 403) {
        errorMessage = 'Bạn không có quyền thêm vào lịch sử xem.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      }
      throw new Error(errorMessage);
    }
  },
};

export default SeriesService;