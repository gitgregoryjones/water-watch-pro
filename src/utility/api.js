import axios from "axios";
import { refreshToken } from "./authUtils"; // Utility function for refreshing tokens
import { API_HOST } from "./constants";

// Create an Axios instance
const api = axios.create({
  baseURL: API_HOST, // Use your API host
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Set a timeout for requests
});

// Request interceptor for adding the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); // Retrieve the token from localStorage
    console.log(`Reading token from localStorage ${token}`)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 errors and refreshing the token
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and it's not a retry, attempt to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call the refresh token endpoint
        const { data } = await refreshToken();
        const newToken = data.token;

        // Update the token in localStorage
        localStorage.setItem("accessToken", newToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Handle refresh token failure (e.g., redirect to login)
        console.error("Token refresh failed:", refreshError);
        //localStorage.removeItem("accessToken"); // Remove the invalid token
        
        //window.location.href = "/login"; // Redirect to login page
        return Promise.reject(refreshError);
      }
    }

    // If it's not a 401 error or refresh fails, reject the error
    return Promise.reject(error);
  }
);

export default api;
