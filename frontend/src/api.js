import axios from 'axios';

const api = axios.create({
  baseURL: `http://${window.location.hostname}:8000/api/`,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Keep standard error propagation
    return Promise.reject(error);
  }
);

export default api;
