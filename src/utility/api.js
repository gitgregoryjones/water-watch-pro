import axios from "axios";
import { refreshToken } from "./authUtils"; // Utility function for refreshing tokens
import { API_HOST } from "./constants";

// Create an Axios instance
const api = axios.create({
  baseURL: API_HOST, // Use your API host
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 100000, // Set a timeout for requests
});

// Request interceptor for adding the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // Retrieve the latest token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Response interceptor for handling 401 errors and refreshing the token
api.interceptors.response.use(
  (response) => {
     // Access custom headers
    
    return response; // Pass through successful responses
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized and retry logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await refreshToken();
        const newToken = data.token;
        localStorage.setItem("accessToken", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    // Specific handling for 400 errors with "details"
    if (error.response.data?.detail) {
      if(error.response.data.detail instanceof Object){
          error.message = error.response.data.detail[0].msg;
      } else {
        error.message = error.response.data.detail;
      }
    }

    return Promise.reject(error);
  }
);


export default api;
