import axios from "axios";

// Único cliente HTTP do app: toda chamada passa por aqui.
// VITE_API_URL permite trocar o endereço (ex.: "/api" para usar o proxy do Vite).
const clientApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
});

export default clientApi;
