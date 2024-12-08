import axios from "axios";
import { API_HOST } from "./constants";
import { useNavigate } from "react-router-dom";

export const refreshToken = async () => {
  
  const refreshToken = localStorage.getItem("accessToken"); // Replace with your token storage mechanism
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(
    `${API_HOST}/api/users/refresh-token`,
    {}, // Pass the payload if required by your API
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    }
  );

  if (!response.data?.token) {
  
    window.location = "/"
    
    throw new Error("Failed to refresh token");

  }

  return response.data.token;
};
