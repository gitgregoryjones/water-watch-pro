import axios from "axios";
import { refreshToken } from "./authUtils"; // Utility function for refreshing tokens
import { API_HOST } from "./constants";

// Create an Axios instance
const apiCSV = axios.create({
  baseURL: API_HOST, // Use your API host
  headers: {
    "Content-Type": "text/csv",
  },
  responseType: "blob",
  timeout: 10000, // Set a timeout for requests
});

// Request interceptor for adding the Authorization header
apiCSV.interceptors.request.use(
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
apiCSV.interceptors.response.use(
  (response) => {
     // Access custom headers
      // Create a Blob URL for the response data
      const blob = new Blob([response.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers["Content-Disposition"];
      console.log(`The disposition is ${contentDisposition}`)
      let filename = "report.csv"; // Default filename

      if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+?)"/);
          if (match && match[1]) {
              filename = match[1];
          }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    
    return {data:"Check your browser downloads to see the file"}; // Pass through successful responses
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


export default apiCSV;
