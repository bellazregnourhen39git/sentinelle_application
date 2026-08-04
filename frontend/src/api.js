import axios from 'axios';

const api = axios.create({
  baseURL: `/api/`,
});

// Helper: sanitize data to avoid sending DOM nodes, React internals or circular objects
const sanitizeForRequest = (input) => {
  if (!input || typeof input !== 'object') return input;
  if (typeof FormData !== 'undefined' && input instanceof FormData) return input;

  const seen = new WeakSet();

  const isProbablyReactFiber = (obj) => {
    if (!obj || typeof obj !== 'object') return false;
    return Object.keys(obj).some(k => k.startsWith('__react') || k === '_reactInternals' || k === '__reactFiber');
  };

  const isDOMNode = (val) => {
    try {
      return typeof Element !== 'undefined' && val instanceof Element;
    } catch (e) {
      return false;
    }
  };

  const clone = (obj) => {
    if (obj === null) return null;
    if (typeof obj !== 'object') return obj;
    if (seen.has(obj)) return undefined;
    if (isDOMNode(obj) || isProbablyReactFiber(obj) || typeof obj === 'function') return undefined;
    seen.add(obj);
    if (Array.isArray(obj)) {
      return obj.map(clone).filter(v => v !== undefined);
    }
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      try {
        const c = clone(v);
        if (c !== undefined) out[k] = c;
      } catch (e) {
        // skip problematic properties
      }
    }
    return out;
  };

  return clone(input);
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Sanitize config.data to avoid circular/DOM nodes being JSON.stringified by axios
  if (config && config.data && !(typeof FormData !== 'undefined' && config.data instanceof FormData)) {
    try {
      config.data = sanitizeForRequest(config.data);
    } catch (e) {
      // If sanitization fails, drop the body to avoid crashing the request pipeline
      // eslint-disable-next-line no-console
      console.warn('Failed to sanitize request data, removing body to avoid circular serialization.', e);
      config.data = {};
    }
  }

  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint = /auth\/(login|refresh|profile)\/?$/.test(requestUrl);

    // Log full server response for debugging 5xx/500 errors
    if (error.response) {
      // eslint-disable-next-line no-console
      console.error('API error response:', { status: error.response.status, url: requestUrl, data: error.response.data });
      // expose last API error for quick inspection in the console
      try { window.__lastApiError = { status: error.response.status, url: requestUrl, data: error.response.data }; } catch (e) { /* ignore */ }
    } else {
      // eslint-disable-next-line no-console
      console.error('API request error (no response):', error);
    }

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('user');
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      window.location.replace('/login');
    }

    return Promise.reject(error);
  }
);

export default api;
