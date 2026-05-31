/** Reusable navbar component */
function renderNavbar(activePage = '') {
  const user = API.getUser();
  const isLoggedIn = Auth.isLoggedIn();

  return `
  <nav class="navbar" id="navbar">
    <div class="navbar-inner">
      <a href="/" class="logo">
        <div class="logo-icon">L</div>
        Luxe<span>Cinema</span>
      </a>
      <button class="nav-toggle" id="navToggle" aria-label="Menu">☰</button>
      <div class="nav-links" id="navLinks">
        <a href="/" class="${activePage === 'home' ? 'active' : ''}">Home</a>
        <a href="/movies.html" class="${activePage === 'movies' ? 'active' : ''}">Movies</a>
        <a href="/movies.html?status=coming_soon" class="${activePage === 'shows' ? 'active' : ''}">Shows</a>
        ${isLoggedIn ? `<a href="/dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">My Tickets</a>` : ''}
        ${isLoggedIn && user?.role === 'admin' ? `<a href="/admin.html" class="${activePage === 'admin' ? 'active' : ''}">Admin</a>` : ''}
      </div>
      <div class="nav-actions">
        ${isLoggedIn
          ? `<span class="text-muted" style="font-size:0.85rem">${user.name}</span>
             <button class="btn btn-ghost btn-sm" onclick="API.logout()">Logout</button>`
          : `<a href="/login.html" class="btn btn-ghost btn-sm">Login</a>
             <a href="/register.html" class="btn btn-primary btn-sm">Sign Up</a>`}
      </div>
    </div>
  </nav>`;
}

function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  toggle?.addEventListener('click', () => links?.classList.toggle('open'));
}

function hideLoader() {
  document.getElementById('pageLoader')?.classList.add('hidden');
}

window.renderNavbar = renderNavbar;
window.initNavbar = initNavbar;
window.hideLoader = hideLoader;
