/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Rankings from '../pages/Rankings'; 

const Comment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [commentCount, setCommentCount] = useState(0);

  const fetchAndSaveComments = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Fetch reviews from TMDB
      const tmdbResponse = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/reviews?language=vi&page=1`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_API_KEY}`,
          },
        }
      );
      if (!tmdbResponse.ok) {
        throw new Error('Không thể tải bình luận từ TMDB');
      }
      const tmdbData = await tmdbResponse.json();
      const tmdbComments = tmdbData.results.map((review) => ({
        author: review.author,
        content: review.content,
        createdAt: review.created_at,
        seriesId: id,
      }));

      // Step 2: Save TMDB comments to backend
      await axios.post(`http://localhost:8080/api/series/${id}/comments/bulk`, tmdbComments, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Step 3: Fetch all comments from backend
      const backendResponse = await fetch(`http://localhost:8080/api/series/${id}/comments`);
      if (!backendResponse.ok) {
        throw new Error('Không thể tải bình luận từ backend');
      }
      const backendData = await backendResponse.json();
      const commentsData = backendData.data || backendData;
      setComments(commentsData);
      setCommentCount(commentsData.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchAndSaveComments();
    }
  }, [id]);

  // Handle comment submission for logged-in users
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setSubmitError('Vui lòng đăng nhập để bình luận.');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      setSubmitError('Bình luận không được để trống.');
      return;
    }

    try {
      const username = localStorage.getItem('username') || 'TL'; // Fallback to 'TL' for initials
      const response = await axios.post(
        `http://localhost:8080/api/series/${id}/comments`,
        {
          content: newComment,
          seriesId: id,
          author: username, 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
        }
      );

      console.log('Comment submission response:', response.data);
      await fetchAndSaveComments();
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      let errorMessage = 'Không thể gửi bình luận. Vui lòng thử lại.';
      if (err.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
        localStorage.clear();
        navigate('/login');
      } else if (err.response?.status === 403) {
        errorMessage = 'Bạn không có quyền gửi bình luận.';
      } else if (err.response) {
        errorMessage = `Lỗi từ server: ${err.response.data.message || err.response.statusText}`;
      }
      setSubmitError(errorMessage);
    }
  };


  const getInitials = (username) => {
    if (!username) return ;
    return username
      .split(' ')
      .map((name) => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) return <p className="text-center text-gray-400 text-lg">Đang tải bình luận...</p>;
  if (error) return (
    <div className="text-center text-red-500 text-lg">
      <p>{error}</p>
      <button
        onClick={() => navigate(-1)}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Quay lại
      </button>
    </div>
  );

  return (
    <div className="bg-[#1a1c21] text-white font-sans min-h-screen">
      <div className="max-w-[1200px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
       
        <section className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center text-white text-sm font-normal px-2">
            <div className="flex items-center gap-2">
              <i className="fas fa-comment-alt"></i>
              <span>{commentCount} bình luận</span>
            </div>
            <div className="font-semibold text-xs">Sort</div>
          </div>
          <form className="flex gap-4 bg-[#2f3035] rounded-md p-4" onSubmit={handleSubmitComment}>
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center text-gray-400 font-semibold text-lg select-none">
                {getInitials(localStorage.getItem('username'))}
              </div>
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Nhập bình luận của bạn tại đây"
              className="flex-1 resize-none bg-[#2f3035] text-gray-400 placeholder-gray-500 rounded-md p-3 focus:outline-none"
              rows="3"
            ></textarea>
            <button
              type="submit"
              className="bg-[#00baff] text-white rounded-md px-5 py-2 text-sm font-semibold whitespace-nowrap"
            >
              Bình luận
            </button>
          </form>
          {/* Comments list */}
          <div className="flex flex-col gap-4 scrollbar-thin max-h-[500px] overflow-y-auto">
            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="bg-[#2a2c31] rounded-xl p-4 flex flex-col gap-2 max-w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center text-gray-400 font-semibold text-lg select-none">
                      {getInitials(comment.author)}
                    </div>
                    <p className="text-sm text-[#00baff] font-semibold">
                      {comment.author}
                      <span className="font-normal text-xs text-gray-300 ml-1">
                        {new Date(comment.createdAt).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })} trước
                      </span>
                    </p>
                  </div>
                  <p className="text-sm text-white">{comment.content}</p>
                  <button className="bg-[#3a3b3f] text-gray-300 text-xs rounded px-3 py-1 self-end">
                    Trả lời
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Chưa có bình luận nào.</p>
            )}
          </div>
        </section>
      
          <Rankings />
        
      </div>
    </div>
  );
};

export default Comment;