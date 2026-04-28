import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://aquasmart-ilif.onrender.com",
  withCredentials: true, // very important
});

export default api;