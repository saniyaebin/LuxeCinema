/** Authentication helpers */
const Auth = {
  isLoggedIn() {
    return !!API.getToken();
  },

  isAdmin() {
    const user = API.getUser();
    return user?.role === 'admin';
  },

  requireAuth(redirect = '/login.html') {
    if (!this.isLoggedIn()) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `${redirect}?return=${returnUrl}`;
      return false;
    }
    return true;
  },

  requireAdmin() {
    if (!this.requireAuth()) return false;
    if (!this.isAdmin()) {
      Toast.error('Admin access required');
      window.location.href = '/';
      return false;
    }
    return true;
  },

  async refreshUser() {
    try {
      const data = await API.get('/auth/me');
      API.setUser(data.user);
      return data.user;
    } catch {
      API.logout();
      return null;
    }
  },
};

window.Auth = Auth;
