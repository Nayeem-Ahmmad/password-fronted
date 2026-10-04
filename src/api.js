import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";
const TOKEN_KEY = "vault_token";

const http = axios.create({ baseURL: API_BASE });

let onUnauthorized = null;

export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const saveToken = (token) => sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && getToken()) {
      clearToken();
      if (onUnauthorized) onUnauthorized();
    }
    return Promise.reject(err);
  }
);

export const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (data?.detail) return data.detail;
  if (data && typeof data === "object") {
    const first = Object.values(data)[0];
    if (Array.isArray(first) && first[0]) return first[0];
  }
  return fallback;
};

export const registerAccount = (name, master_key, recovery_question, recovery_answer) =>
  http.post("/register/", { name, master_key, recovery_question, recovery_answer });

export const loginAccount = (name, master_key) =>
  http.post("/login/", { name, master_key });

export const fetchMe = () => http.get("/me/");

export const fetchRecoveryQuestion = (name) =>
  http.post("/recovery/question/", { name });

export const verifyRecovery = (name, recovery_answer) =>
  http.post("/recovery/verify/", { name, recovery_answer });

export const resetMasterKey = (new_master_key, reset_token) =>
  http.post("/reset-key/", { new_master_key, reset_token });

export const fetchEntries = () => http.get("/entries/");

export const encodePassword = (name, password) =>
  http.post("/encode/", { name, password });

export const decodePassword = (encoded_password, master_key) =>
  http.post("/decode/", { encoded_password, master_key });

export const deleteEntry = (id) => http.delete(`/entries/${id}/`);

export const updateEntry = (id, payload) => http.patch(`/entries/${id}/`, payload);
export const exportBackup = () => http.get("/backup/export/");