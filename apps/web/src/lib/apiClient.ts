import axios from 'axios';

/** Same-origin `/api` uses the Vite proxy in local dev. Set VITE_API_URL only when the API is on another host. */
function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw.trim().replace(/\/$/, '');
  }
  return '/api';
}

export const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 20_000,
  headers: { 'Content-Type': 'application/json' },
});

const TOKEN_KEY = 'porchlight_admin_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && getStoredToken()) {
      setStoredToken(null);
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Cannot reach the API. Confirm the backend is running on port 4000.';
    }
    const data = error.response.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    if (data?.errors && typeof data.errors === 'object') {
      const details = Object.entries(data.errors)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
        .join('; ');
      return details ? `${data.message || 'Validation failed'} (${details})` : (data.message ?? 'Validation failed');
    }
    return data?.message ?? error.message ?? 'Something went wrong';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
}
