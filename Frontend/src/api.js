import axios from "axios";
import { config } from "./config";

const api = axios.create({
  baseURL: config.apiBackend,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
