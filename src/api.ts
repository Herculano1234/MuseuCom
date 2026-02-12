/// <reference types="vite/client" />
import axios, { AxiosRequestHeaders } from "axios";

const baseURL = (import.meta as any).env?.VITE_API_URL ?? '';

const api = axios.create({
  baseURL,
  timeout: 60000,
});

// Instância sem interceptors para chamadas de auth (refresh) para evitar loops
const authClient = axios.create({ baseURL, timeout: 20000 });

// Adiciona automaticamente o token JWT (se existir) em todas as requisições
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('museucom-token');
    if (token) {
      // Normalize headers to AxiosRequestHeaders
      const headers = (config.headers || {}) as AxiosRequestHeaders;
      headers.Authorization = `Bearer ${token}` as unknown as string;
      config.headers = headers;
    }
  } catch (err) {
    // ignore
  }
  return config;
});

// Quando receber 401, limpa o estado de autenticação localmente
// Refresh automático quando receber 401 (tenta trocar refresh token e refazer a requisição)
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
const subscribeTokenRefresh = (cb: (token: string) => void) => { refreshSubscribers.push(cb); };
const onRefreshed = (token: string) => { refreshSubscribers.forEach(cb => cb(token)); refreshSubscribers = []; };

api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const status = error?.response?.status;
    const originalRequest = error?.config;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('museucom-refresh');
      if (!refreshToken) {
        // sem refresh token: limpa estado e rejeita
        try { localStorage.removeItem('museucom-token'); localStorage.removeItem('museucom-user'); localStorage.removeItem('museucom-auth'); localStorage.removeItem('museucom-perfil'); localStorage.removeItem('museucom-refresh'); } catch(e){}
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // já em processo de refresh: aguarda
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            const headers = (originalRequest.headers || {}) as AxiosRequestHeaders;
            headers.Authorization = `Bearer ${token}` as unknown as string;
            originalRequest.headers = headers as any;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const resp = await authClient.post('/auth/refresh', { refreshToken });
        const newToken = resp.data?.token;
        const newRefresh = resp.data?.refreshToken;
        if (newToken) localStorage.setItem('museucom-token', newToken);
        if (newRefresh) localStorage.setItem('museucom-refresh', newRefresh);
        // notifica subscribers e refaz a requisição original
        onRefreshed(newToken);
        const headers = (originalRequest.headers || {}) as AxiosRequestHeaders;
        headers.Authorization = `Bearer ${newToken}` as unknown as string;
        originalRequest.headers = headers as any;
        return api(originalRequest);
      } catch (refreshErr) {
        try { localStorage.removeItem('museucom-token'); localStorage.removeItem('museucom-user'); localStorage.removeItem('museucom-auth'); localStorage.removeItem('museucom-perfil'); localStorage.removeItem('museucom-refresh'); } catch(e){}
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
