import axios from 'axios';

// Cấu hình base URL cho tất cả yêu cầu API
const API_BASE_URL = 'http://localhost:8080/api';

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
    const response = await api.get('/animations');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch animations: ' + error.message);
  }
};

// Xuất các hàm API khác nếu cần (ví dụ: tạo, cập nhật, xóa)
// export const createAnimation = async (data) => {
//   const response = await api.post('/animations', data);
//   return response.data;
// };