
import axios from "axios";
import api from "./axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

export const loginUser = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await axios.post(
    `${API_URL}/auth/login`,
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateCurrentUser = async (profileData) => {
  const response = await api.put("/auth/me", profileData);
  return response.data;
};

// Requires an existing backend endpoint at POST /auth/change-password.
export const changePassword = async (passwordData) => {
  const response = await api.post(
    "/auth/change-password",
    passwordData
  );
  return response.data;
};
