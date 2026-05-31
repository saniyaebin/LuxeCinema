document.getElementById('navbar').innerHTML = renderNavbar('home');
document.getElementById('footer').innerHTML = renderFooter();
initNavbar();

async function loadHome() {
  try {
    const [featured, trending, upcoming] = await Promise.all([
      API.get('/movies?featured=true'),
      API.get('/movies?trending=true'),
      API.get('/movies?status=coming_soon'),
    ]);

    const heroMovie = featured.movies[0] || trending.movies[0];
    if (heroMovie) {
      document.getElementById('heroTitle').textContent = heroMovie.title;
      document.getElementById('heroDesc').textContent = heroMovie.description.slice(0, 160) + '...';
      document.getElementById('heroBg').style.backgroundImage = `url('${heroMovie.backdrop || heroMovie.poster}')`;
      document.querySelector('.hero-actions').innerHTML = `
        <a href="/show.html?id=${heroMovie._id}" class="btn btn-primary btn-lg">Book Now</a>
        <a href="#featured" class="btn btn-outline btn-lg">Explore Featured</a>`;
    }

    document.getElementById('featuredCarousel').innerHTML =
      featured.movies.map((m) => `<div style="flex:0 0 200px">${movieCardHTML(m)}</div>`).join('') ||
      '<p class="text-muted">No featured movies yet.</p>';

    document.getElementById('trendingGrid').innerHTML =
      trending.movies.slice(0, 6).map((m) => `
        <div class="movie-list-card glass-card">
          <a href="/show.html?id=${m._id}">
            <div class="poster-wrap">${movieImgTag(m.poster, m.title)}</div>
            <div class="info">
              <h3>${m.title}</h3>
              <div class="movie-meta-row">
                <span class="rating-badge">★ ${m.rating}</span>
                <span>${m.genre?.join(', ')}</span>
                <span>${m.duration} min</span>
              </div>
              <span class="btn btn-primary btn-sm btn-block">Book Now</span>
            </div>
          </a>
        </div>`).join('');

    document.getElementById('upcomingCarousel').innerHTML =
      upcoming.movies.map((m) => `<div style="flex:0 0 200px">${movieCardHTML(m)}</div>`).join('') ||
      '<p class="text-muted">No upcoming releases.</p>';
  } catch (err) {
    Toast.error(err.message || 'Failed to load movies');
  } finally {
    hideLoader();
  }
}

loadHome();
