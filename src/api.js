import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api";

export const fetchEntries = () => axios.get(`${API_BASE}/entries/`);

export const encodePassword = (name, password) =>
  axios.post(`${API_BASE}/encode/`, { name, password });

export const decodePassword = (encoded_password, master_key) =>
  axios.post(`${API_BASE}/decode/`, { encoded_password, master_key });