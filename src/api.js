import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const http = axios.create({ baseURL: API_BASE });

export const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (data?.detail) return data.detail;
  if (data && typeof data === "object") {
    const first = Object.values(data)[0];
    if (Array.isArray(first) && first[0]) return first[0];
  }
  return fallback;
};

export const fetchStatus = () => http.get("/config/");

export const setupVault = (name, master_key) =>
  http.post("/setup/", { name, master_key });

export const loginVault = (master_key) => http.post("/login/", { master_key });

export const resetMasterKey = (new_master_key) =>
  http.post("/reset-key/", { new_master_key });

export const fetchEntries = () => http.get("/entries/");

export const encodePassword = (name, password) =>
  http.post("/encode/", { name, password });

export const decodePassword = (encoded_password, master_key) =>
  http.post("/decode/", { encoded_password, master_key });

export const deleteEntry = (id) => http.delete(`/entries/${id}/`);