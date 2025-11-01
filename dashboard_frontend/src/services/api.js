import { mockApi } from './mock';
import { isTrue } from '../utils/env';

const DEFAULT_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';
let authToken = null;

function headers() {
  const h = { 'Content-Type': 'application/json' };
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
      const res = await fetch(`${DEFAULT_BASE}/auth/login`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    },
    /** Register user; mocked when REACT_APP_USE_MOCK=true */
    async register({ name, email, password }) {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.auth.register({ name, email, password });
      }
      const res = await fetch(`${DEFAULT_BASE}/auth/register`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error('Register failed');
      return res.json();
    },
  },
  dashboard: {
    /** Fetch dashboard summary stats and latest activity */
    async summary() {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.dashboard.summary();
      }
      const res = await fetch(`${DEFAULT_BASE}/dashboard/summary`, { headers: headers() });
      if (!res.ok) throw new Error('Failed to load summary');
      return res.json();
    },
  },
  videos: {
    /** List videos with statuses */
    async list() {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.videos.list();
      }
      const res = await fetch(`${DEFAULT_BASE}/videos`, { headers: headers() });
      if (!res.ok) throw new Error('Failed to load videos');
      return res.json();
    },
    /** Upload new video (not mocked fully; here we just simulate) */
    async upload(file) {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.videos.upload(file);
      }
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${DEFAULT_BASE}/videos/upload`, {
        method: 'POST',
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        body: form
      });
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    }
  },
  analytics: {
    /** Fetch analytics reports */
    async list() {
      if (isTrue(process.env.REACT_APP_USE_MOCK)) {
        return mockApi.analytics.list();
      }
      const res = await fetch(`${DEFAULT_BASE}/analytics`, { headers: headers() });
      if (!res.ok) throw new Error('Failed to load analytics');
      return res.json();
    }
  }
};
