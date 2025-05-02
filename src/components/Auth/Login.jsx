import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchUserInfo } from '../Auth/utils/auth';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.debug('[Login] Attempting login with:', { username });

    try {
      const response = await axios.post(
        'http://localhost:8080/api/v1/auth/login',
        { username, password },
        { withCredentials: true } // Ensure refreshToken cookie is set
      );
      console.debug('[Login] Login response:', {
        status: response.status,
        headers: response.headers,
        data: response.data,
      });

      // Extract accessToken
      const accessToken = response.data.accessToken || (response.data.data && response.data.data.accessToken);
      if (!accessToken) {
        console.error('[Login] Response structure:', response.data);
        throw new Error('No access token found in response');
      }

      // Store accessToken in localStorage
      localStorage.setItem('accessToken', accessToken);
      console.debug('[Login] Stored accessToken:', accessToken);

      // Fetch and store user info
      try {
        const userData = await fetchUserInfo();
        console.debug('[Login] User info fetched:', userData);

        // Ensure userData has expected fields
        const userInfo = {
          id: userData.id || userData.data?.id || 'unknown',
          email: userData.email || userData.data?.email || 'unknown',
          name: userData.name || userData.data?.name || 'Người dùng',
        };

        localStorage.setItem('userId', userInfo.id);
        localStorage.setItem('userEmail', userInfo.email);
        localStorage.setItem('userName', userInfo.name);
        console.debug('[Login] Stored user info:', userInfo);
      } catch (userErr) {
        console.error('[Login] Failed to fetch user info:', {
          message: userErr.message,
          response: userErr.response ? {
            status: userErr.response.status,
            data: userErr.response.data,
          } : 'No response received',
        });
        // Set default user info to avoid undefined
        localStorage.setItem('userId', 'unknown');
        localStorage.setItem('userEmail', 'unknown');
        localStorage.setItem('userName', 'Người dùng');
        setError('Đăng nhập thành công nhưng không thể lấy thông tin người dùng.');
      }

      console.log('[Login] Login successful');
      // Navigate to home page and reload
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('[Login] Login error:', {
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          data: err.response.data,
        } : 'No response received',
      });
      let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập hoặc mật khẩu.';
      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err.request) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.debug('[Login] Loading state: false');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-lg text-white">
        <h2 className="text-3xl font-bold text-blue-300 mb-6 text-center">Đăng Nhập</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              Tên đăng nhập
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-2 w-full bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-400 hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;