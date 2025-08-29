
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001' }); // FastAPI backend port

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const t = localStorage.getItem('access_token');
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

// Capture rolling token from server and store it
api.interceptors.response.use(
  (response) => {
    const newToken = response.headers['x-new-access-token'];
    if (newToken) {
      localStorage.setItem('access_token', newToken);
    }
    return response;
  },
  (error) => {
    const newToken = error?.response?.headers?.['x-new-access-token'];
    if (newToken) {
      localStorage.setItem('access_token', newToken);
    }
    return Promise.reject(error);
  }
);

export default api;