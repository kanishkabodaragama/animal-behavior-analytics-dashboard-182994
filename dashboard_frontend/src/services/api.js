import { mockApi } from './mock';
import { isTrue } from '../utils/env';

const DEFAULT_BASE =
  process.env.REACT_APP_API_BASE || process.env.REACT_APP_API_BASE_URL || 'https://sbh3fg3j-5050.asse.devtunnels.ms';
let authToken = null;

function headers(json = true) {
  const h = {};
  if (json) h['Content-Type'] = 'application/json';
  if (authToken) h['Authorization'] = `Bearer ${authToken}`;
  return h;
}

// PUBLIC_INTERFACE
export const api = {
  /** Configure bearer token for subsequent calls */
  setToken(token) {
    authToken = token;
  },

  auth: {
    /** Login user; mocked when REACT_APP_USE_MOCK=true */
    async login({ email, password }) {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.auth.login({ email, password });
      }
      const res = await fetch(`${DEFAULT_BASE}/api/login`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => 'Login failed');
        throw new Error(errText || 'Login failed');
      }
      return res.json();
    },

    /** Register user; mocked when REACT_APP_USE_MOCK=true */
    async register({ name, email, password }) {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.auth.register({ name, email, password });
      }
      // adapt path if your backend uses a different register endpoint
      const res = await fetch(`${DEFAULT_BASE}/api/register`, {
        method: 'POST',
        headers: headers(true),
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => 'Register failed');
        throw new Error(errText || 'Register failed');
      }
      return res.json();
    },
  },

  dashboard: {
    /** Fetch dashboard summary stats and latest activity */
    async summary() {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.dashboard.summary();
      }
      const res = await fetch(`${DEFAULT_BASE}/api/dashboard`, { headers: headers(true) });
      if (!res.ok) {
        const errText = await res.text().catch(() => 'Failed to load summary');
        throw new Error(errText || 'Failed to load summary');
      }
      return res.json();
    },
  },

  videos: {
    /** List videos with statuses (expects backend /api/videos) */
    async list() {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.videos.list();
      }
      const res = await fetch(`${DEFAULT_BASE}/api/videos`, { headers: headers(true) });
      if (!res.ok) {
        const errText = await res.text().catch(() => 'Failed to load videos');
        throw new Error(errText || 'Failed to load videos');
      }
      return res.json();
    },

    /** Upload new video */
    async upload(file) {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.videos.upload(file);
      }
      const form = new FormData();
      form.append('file', file);

      // For multipart we must NOT set Content-Type (browser will set boundary)
      const res = await fetch(`${DEFAULT_BASE}/api/videos/upload`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        body: form,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => 'Upload failed');
        throw new Error(errText || 'Upload failed');
      }
      return res.json();
    },

    /** Get metadata / sheet link for a video */
    async get(id) {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.videos.get(id);
      }
      const res = await fetch(`${DEFAULT_BASE}/api/videos/${encodeURIComponent(id)}`, {
        headers: headers(true),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => 'Failed to fetch video');
        throw new Error(errText || 'Failed to fetch video');
      }
      return res.json();
    },

    /** Request sheet metadata (could return {url} or json) */
    async getSheet(id) {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.videos.getSheet(id);
      }
      const res = await fetch(`${DEFAULT_BASE}/api/videos/${encodeURIComponent(id)}/sheet`, {
        headers: headers(true),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => 'Failed to get sheet');
        throw new Error(errText || 'Failed to get sheet');
      }
      // try to parse json; if not JSON, return text
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) return res.json();
      return res.text();
    },

    /** Download sheet file as Blob */
    async download(id) {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.videos.download(id);
      }
      const res = await fetch(`${DEFAULT_BASE}/api/videos/${encodeURIComponent(id)}/download`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => 'Download failed');
        throw new Error(errText || 'Download failed');
      }
      // return blob for client to handle
      return res.blob();
    },

    /** Delete a video/job */
    async delete(id) {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.videos.delete(id);
      }
      const res = await fetch(`${DEFAULT_BASE}/api/videos/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: headers(true),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => 'Delete failed');
        throw new Error(errText || 'Delete failed');
      }
      // backend may return JSON confirmation
      return res.json().catch(() => ({ deleted: true }));
    },
  },

  analytics: {
    /** Fetch analytics reports */
    async list() {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.analytics.list();
      }
      const res = await fetch(`${DEFAULT_BASE}/api/analytics`, { headers: headers(true) });
      if (!res.ok) {
        const errText = await res.text().catch(() => 'Failed to load analytics');
        throw new Error(errText || 'Failed to load analytics');
      }
      return res.json();
    },
  },
};

export default api;
