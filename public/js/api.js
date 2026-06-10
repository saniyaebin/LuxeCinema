/** API client for LuxeCinema backend */
const API = {
 base:'http://localhost:3000/api',

  getToken() {
    return localStorage.getItem('luxecinema_token');
  },

  setToken(token) {
    if (token) localStorage.setItem('luxecinema_token', token);
    else localStorage.removeItem('luxecinema_token');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('luxecinema_user') || 'null');
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) localStorage.setItem('luxecinema_user', JSON.stringify(user));
    else localStorage.removeItem('luxecinema_user');
  },

  logout() {
    this.setToken(null);
    this.setUser(null);
    window.location.href = '/login.html';
  },

  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${this.base}${endpoint}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data.message || 'Request failed');
      err.status = res.status;
      throw err;
    }
    return data;
  },

  get(endpoint) { return this.request(endpoint); },
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); },
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); },
  patch(endpoint, body) { return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }); },
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); },
};

window.API = API;
