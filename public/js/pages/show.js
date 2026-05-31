document.getElementById('navbar').innerHTML = renderNavbar('movies');
document.getElementById('footer').innerHTML = renderFooter();
initNavbar();

const movieId = new URLSearchParams(window.location.search).get('id');
let selectedShowId = null;

if (!movieId) {
  window.location.href = '/movies.html';
}

async function loadShow() {
  try {
    const { movie } = await API.get(`/movies/${movieId}`);
    const showsData = await API.get(`/shows?movie=${movieId}`);
    const shows = showsData.shows;

    const today = new Date().toISOString().split('T')[0];
    const dates = [...new Set(shows.map((s) => new Date(s.date).toISOString().split('T')[0]))].sort();

    document.getElementById('showContent').innerHTML = `
      <div class="show-hero-grid">
        <div class="show-poster glass-card">
          ${movieImgTag(movie.poster, movie.title)}
        </div>
        <div class="show-info">
          <h1>${movie.title}</h1>
          <div class="show-tags">
            ${movie.genre.map((g) => `<span class="tag">${g}</span>`).join('')}
            <span class="tag">${movie.language}</span>
            <span class="rating-badge">★ ${movie.rating}</span>
            <span class="tag">${movie.duration} min</span>
          </div>
          <p style="color:var(--text-secondary);margin-bottom:1.5rem;line-height:1.8">${movie.description}</p>
          ${movie.status === 'now_showing'
            ? `<p class="text-gold" style="font-weight:600;margin-bottom:1rem">From ${formatCurrency(movie.price)} per seat</p>`
            : `<p class="text-muted">Coming ${formatDate(movie.releaseDate)}</p>`}
        </div>
      </div>

      ${movie.trailer ? `
      <section style="margin-top:2rem">
        <h2 class="section-title" style="font-size:1.5rem">Trailer</h2>
        <div class="trailer-wrap glass-card">
          <iframe src="${movie.trailer}" allowfullscreen loading="lazy"></iframe>
        </div>
      </section>` : ''}

      ${movie.cast?.length ? `
      <section style="margin-top:2rem">
        <h2 class="section-title" style="font-size:1.5rem">Cast</h2>
        <div class="cast-grid">
          ${movie.cast.map((c) => `
            <div class="cast-card glass-card">
              <div class="cast-avatar">${c.name.charAt(0)}</div>
              <strong>${c.name}</strong>
              <p class="text-muted" style="font-size:0.85rem">${c.role}</p>
            </div>`).join('')}
        </div>
      </section>` : ''}

      ${movie.status === 'now_showing' ? `
      <section class="showtimes-section">
        <h2 class="section-title" style="font-size:1.5rem;margin-top:2rem">Select <span class="text-gold">Showtime</span></h2>
        <div class="form-group" style="max-width:280px;margin:1rem 0">
          <label>Date</label>
          <select id="dateSelect" class="form-control">
            ${dates.map((d) => `<option value="${d}" ${d === today ? 'selected' : ''}>${formatDate(d)}</option>`).join('')}
          </select>
        </div>
        <div id="showtimesList"></div>
        <p class="text-muted" style="font-size:0.85rem;margin:1rem 0">You must be logged in to book. Flow: seats → payment (card / UPI QR) → ticket QR.</p>
        <div style="margin-top:1rem">
          <button class="btn btn-primary btn-lg" id="bookBtn" disabled>Continue to Seats</button>
        </div>
      </section>` : ''}
    `;

    if (movie.status === 'now_showing') {
      window._shows = shows;
      document.getElementById('dateSelect').addEventListener('change', renderShowtimes);
      document.getElementById('bookBtn').addEventListener('click', () => {
        if (!Auth.requireAuth()) return;
        if (!selectedShowId) return;
        window.location.href = `/seats.html?show=${selectedShowId}`;
      });
      renderShowtimes();
    }
  } catch (err) {
    Toast.error(err.message);
    setTimeout(() => { window.location.href = '/movies.html'; }, 1500);
  } finally {
    hideLoader();
  }
}

function renderShowtimes() {
  const date = document.getElementById('dateSelect').value;
  const shows = window._shows.filter((s) => new Date(s.date).toISOString().split('T')[0] === date);

  const byTheater = {};
  shows.forEach((s) => {
    const tid = s.theater._id;
    if (!byTheater[tid]) byTheater[tid] = { theater: s.theater, shows: [] };
    byTheater[tid].shows.push(s);
  });

  document.getElementById('showtimesList').innerHTML = Object.values(byTheater).map(({ theater, shows: tShows }) => `
    <div class="theater-block glass-card">
      <h3>${theater.name}</h3>
      <p class="location">${theater.location}, ${theater.city}</p>
      <div class="time-slots" data-theater="${theater._id}">
        ${tShows.map((s) => {
          const avail = s.totalSeats - (s.bookedSeats?.length || 0);
          return `<button class="time-slot" data-show="${s._id}" data-price="${s.price}">
            ${s.startTime}<br><small style="color:var(--text-muted)">${avail} seats · ${formatCurrency(s.price)}</small>
          </button>`;
        }).join('')}
      </div>
    </div>`).join('') || '<p class="text-muted">No shows for this date.</p>';

  document.querySelectorAll('.time-slot').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-slot').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedShowId = btn.dataset.show;
      document.getElementById('bookBtn').disabled = false;
    });
  });
}

loadShow();
