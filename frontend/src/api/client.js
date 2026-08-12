const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('sajan_token');
}

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const authApi = {
  register: (body) => api('/auth/register', { method: 'POST', body }),
  login: (body) => api('/auth/login', { method: 'POST', body }),
  me: () => api('/auth/me'),
};

export const productsApi = {
  list: () => api('/products'),
  get: (id) => api(`/products/${id}`),
  create: (body) => api('/products', { method: 'POST', body }),
  update: (id, body) => api(`/products/${id}`, { method: 'PUT', body }),
  remove: (id) => api(`/products/${id}`, { method: 'DELETE' }),
  setSale: (id, body) => api(`/products/${id}/sale`, { method: 'PATCH', body }),
};

export const ordersApi = {
  create: (body) => api('/orders', { method: 'POST', body }),
  my: () => api('/orders/my'),
  get: (id) => api(`/orders/${id}`),
  list: (status) => api(`/orders${status ? `?status=${status}` : ''}`),
  setStatus: (id, status) => api(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
};

export const settingsApi = {
  public: () => api('/settings/public'),
  get: () => api('/settings'),
  update: (body) => api('/settings', { method: 'PUT', body }),
  toggleSale: (active) => api('/settings/sale', { method: 'POST', body: { active } }),
};
