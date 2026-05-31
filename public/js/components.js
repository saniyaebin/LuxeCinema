/** Reusable UI components */
const FALLBACK_POSTER = '/assets/placeholder-poster.svg';

function posterOnError(el) {
  el.onerror = null;
  el.src = FALLBACK_POSTER;
}

function movieImgTag(url, title, extraClass = '') {
  const src = url || FALLBACK_POSTER;
  return `<img src="${src}" alt="${title}" loading="lazy" class="${extraClass}" referrerpolicy="no-referrer" onerror="posterOnError(this)">`;
}

function renderFooter() {
  return `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="logo" style="margin-bottom:1rem">
            <div class="logo-icon">L</div>
            Luxe<span>Cinema</span>
          </div>
          <p class="text-muted" style="font-size:0.9rem;max-width:280px">
            Premium cinematic experiences. Book your seats for the finest films in luxury theaters worldwide.
          </p>
        </div>
        <div>
          <h4 style="margin-bottom:1rem;font-family:var(--font-body);font-size:0.9rem">Explore</h4>
          <ul style="display:flex;flex-direction:column;gap:0.5rem">
            <li><a href="/movies.html" class="text-muted">Now Showing</a></li>
            <li><a href="/movies.html?status=coming_soon" class="text-muted">Coming Soon</a></li>
          </ul>
        </div>
        <div>
          <h4 style="margin-bottom:1rem;font-family:var(--font-body);font-size:0.9rem">Account</h4>
          <ul style="display:flex;flex-direction:column;gap:0.5rem">
            <li><a href="/login.html" class="text-muted">Login</a></li>
            <li><a href="/register.html" class="text-muted">Register</a></li>
            <li><a href="/dashboard.html" class="text-muted">My Tickets</a></li>
          </ul>
        </div>
        <div>
          <h4 style="margin-bottom:1rem;font-family:var(--font-body);font-size:0.9rem">Contact</h4>
          <p class="text-muted" style="font-size:0.9rem">support@luxecinema.com<br>+1 (800) LUXE-FILM</p>
        </div>
      </div>
      <div class="footer-bottom">© ${new Date().getFullYear()} LuxeCinema. All rights reserved.</div>
    </div>
  </footer>`;
}

function movieCardHTML(movie, link = true) {
  const genres = Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre;
  const href = link ? `/show.html?id=${movie._id}` : '#';
  return `
    <a href="${href}" class="movie-card glass-card">
      ${movieImgTag(movie.poster, movie.title)}
      <div class="movie-card-overlay">
        <div class="movie-card-title">${movie.title}</div>
        <div class="movie-card-meta">
          <span class="rating-badge">★ ${movie.rating}</span>
          <span>${genres}</span>
        </div>
      </div>
    </a>`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatCurrency(amount) {
  return `$${Number(amount).toFixed(2)}`;
}

window.FALLBACK_POSTER = FALLBACK_POSTER;
window.posterOnError = posterOnError;
window.movieImgTag = movieImgTag;
window.renderFooter = renderFooter;
window.movieCardHTML = movieCardHTML;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
