// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://test-deploy-be.render.com/api',
});

// Luôn lấy token từ localStorage user
api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (err) {
    // Nếu lỗi thì bỏ qua, không set header
  }
  return config;
});

export default api;