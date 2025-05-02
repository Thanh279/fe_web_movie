import axios from 'axios';

// Export hằng số base URL để có thể tái sử dụng ở nơi khác
export const API_BASE_URL = 'http://localhost:8080';
export const API = 'http://localhost:8080'
// Tạo instance của axios với base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm lấy danh sách animations
export const getAllAnimations = async () => {
  try {
    const response = await api.get('api/animations');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch animations: ' + error.message);
  }
};
