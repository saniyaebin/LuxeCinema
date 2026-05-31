document.getElementById('navbar').innerHTML = renderNavbar('admin');
initNavbar();

if (!Auth.requireAdmin()) throw new Error('admin');

let movies = [];
let theaters = [];
let shows = [];

document.querySelectorAll('.admin-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    loadPanel(tab.dataset.panel);
  });
});

function openModal(html) {
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
}

document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') closeModal();
});

async function loadPanel(panel) {
  const el = document.getElementById('adminPanel');
  el.innerHTML = '<div class="loader-spinner" style="margin:2rem auto"></div>';

  try {
    if (panel === 'analytics') await renderAnalytics(el);
    else if (panel === 'movies') await renderMoviesAdmin(el);
    else if (panel === 'shows') await renderShowsAdmin(el);
    else if (panel === 'theaters') await renderTheatersAdmin(el);
    else if (panel === 'bookings') await renderBookingsAdmin(el);
  } catch (err) {
    el.innerHTML = `<p class="text-muted">${err.message}</p>`;
  } finally {
    hideLoader();
  }
}

async function renderAnalytics(el) {
  const { analytics } = await API.get('/admin/analytics');
  el.innerHTML = `
    <div class="admin-stats">
      <div class="stat-card glass-card"><div class="value">${analytics.confirmedBookings}</div><div class="label">Confirmed Bookings</div></div>
      <div class="stat-card glass-card"><div class="value">${formatCurrency(analytics.totalRevenue)}</div><div class="label">Total Revenue</div></div>
      <div class="stat-card glass-card"><div class="value">${analytics.totalMovies}</div><div class="label">Movies</div></div>
      <div class="stat-card glass-card"><div class="value">${analytics.totalShows}</div><div class="label">Shows</div></div>
      <div class="stat-card glass-card"><div class="value">${analytics.totalUsers}</div><div class="label">Users</div></div>
    </div>
    <h3 style="margin-bottom:1rem">Recent Bookings</h3>
    <div class="admin-table-wrap glass-card" style="padding:1rem">
      <table class="admin-table">
        <thead><tr><th>Movie</th><th>User</th><th>Amount</th><th>Date</th></tr></thead>
        <tbody>
          ${analytics.recentBookings?.map((b) => `
            <tr><td>${b.movie?.title}</td><td>${b.user?.name}</td><td>${formatCurrency(b.totalAmount)}</td><td>${new Date(b.createdAt).toLocaleDateString()}</td></tr>
          `).join('') || '<tr><td colspan="4">No bookings</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

async function renderMoviesAdmin(el) {
  const data = await API.get('/movies');
  movies = data.movies;

  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:1.5rem">
      <h3>Movies (${movies.length})</h3>
      <button class="btn btn-primary btn-sm" id="addMovie">+ Add Movie</button>
    </div>
    <div class="admin-table-wrap glass-card" style="padding:1rem">
      <table class="admin-table">
        <thead><tr><th>Title</th><th>Genre</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${movies.map((m) => `
            <tr>
              <td>${m.title}</td>
              <td>${m.genre?.join(', ')}</td>
              <td>${m.rating}</td>
              <td>${m.status}</td>
              <td>
                <button class="btn btn-ghost btn-sm" data-edit-movie="${m._id}">Edit</button>
                <button class="btn btn-danger btn-sm" data-del-movie="${m._id}">Delete</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  document.getElementById('addMovie').onclick = () => showMovieForm();
  document.querySelectorAll('[data-edit-movie]').forEach((btn) => {
    btn.onclick = () => showMovieForm(movies.find((m) => m._id === btn.dataset.editMovie));
  });
  document.querySelectorAll('[data-del-movie]').forEach((btn) => {
    btn.onclick = async () => {
      if (!confirm('Delete this movie?')) return;
      await API.delete(`/movies/${btn.dataset.delMovie}`);
      Toast.success('Movie deleted');
      loadPanel('movies');
    };
  });
}

function showMovieForm(movie = null) {
  openModal(`
    <div class="modal-header"><h3>${movie ? 'Edit' : 'Add'} Movie</h3><button class="modal-close" onclick="closeModal()">×</button></div>
    <form id="movieForm">
      <div class="form-group"><label>Title</label><input class="form-control" name="title" value="${movie?.title || ''}" required></div>
      <div class="form-group"><label>Description</label><textarea class="form-control" name="description" rows="3" required>${movie?.description || ''}</textarea></div>
      <div class="form-group"><label>Genre (comma-separated)</label><input class="form-control" name="genre" value="${movie?.genre?.join(', ') || ''}" required></div>
      <div class="form-group"><label>Language</label><input class="form-control" name="language" value="${movie?.language || 'English'}" required></div>
      <div class="form-group"><label>Duration (min)</label><input type="number" class="form-control" name="duration" value="${movie?.duration || 120}" required></div>
      <div class="form-group"><label>Rating</label><input type="number" step="0.1" class="form-control" name="rating" value="${movie?.rating || 8}" required></div>
      <div class="form-group"><label>Poster URL</label><input class="form-control" name="poster" value="${movie?.poster || ''}" required></div>
      <div class="form-group"><label>Price</label><input type="number" step="0.01" class="form-control" name="price" value="${movie?.price || 12.99}" required></div>
      <div class="form-group"><label>Status</label>
        <select class="form-control" name="status">
          <option value="now_showing" ${movie?.status === 'now_showing' ? 'selected' : ''}>Now Showing</option>
          <option value="coming_soon" ${movie?.status === 'coming_soon' ? 'selected' : ''}>Coming Soon</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Save</button>
    </form>`);

  document.getElementById('movieForm').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      title: fd.get('title'),
      description: fd.get('description'),
      genre: fd.get('genre').split(',').map((g) => g.trim()),
      language: fd.get('language'),
      duration: Number(fd.get('duration')),
      rating: Number(fd.get('rating')),
      poster: fd.get('poster'),
      price: Number(fd.get('price')),
      status: fd.get('status'),
      releaseDate: movie?.releaseDate || new Date(),
    };
    try {
      if (movie) await API.put(`/movies/${movie._id}`, body);
      else await API.post('/movies', body);
      Toast.success('Movie saved');
      closeModal();
      loadPanel('movies');
    } catch (err) {
      Toast.error(err.message);
    }
  };
}

async function renderTheatersAdmin(el) {
  const data = await API.get('/theaters');
  theaters = data.theaters;

  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:1.5rem">
      <h3>Theaters (${theaters.length})</h3>
      <button class="btn btn-primary btn-sm" id="addTheater">+ Add Theater</button>
    </div>
    <div class="admin-table-wrap glass-card" style="padding:1rem">
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Location</th><th>City</th><th>Actions</th></tr></thead>
        <tbody>${theaters.map((t) => `
          <tr><td>${t.name}</td><td>${t.location}</td><td>${t.city}</td>
          <td><button class="btn btn-danger btn-sm" data-del-theater="${t._id}">Delete</button></td></tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  document.getElementById('addTheater').onclick = () => {
    openModal(`
      <div class="modal-header"><h3>Add Theater</h3><button class="modal-close" onclick="closeModal()">×</button></div>
      <form id="theaterForm">
        <div class="form-group"><label>Name</label><input class="form-control" name="name" required></div>
        <div class="form-group"><label>Location</label><input class="form-control" name="location" required></div>
        <div class="form-group"><label>City</label><input class="form-control" name="city" required></div>
        <button type="submit" class="btn btn-primary btn-block">Save</button>
      </form>`);
    document.getElementById('theaterForm').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await API.post('/theaters', { name: fd.get('name'), location: fd.get('location'), city: fd.get('city') });
      Toast.success('Theater added');
      closeModal();
      loadPanel('theaters');
    };
  };

  document.querySelectorAll('[data-del-theater]').forEach((btn) => {
    btn.onclick = async () => {
      if (!confirm('Delete theater?')) return;
      await API.delete(`/theaters/${btn.dataset.delTheater}`);
      Toast.success('Deleted');
      loadPanel('theaters');
    };
  });
}

async function renderShowsAdmin(el) {
  const [showsData, moviesData, theatersData] = await Promise.all([
    API.get('/shows'),
    API.get('/movies'),
    API.get('/theaters'),
  ]);
  shows = showsData.shows;
  movies = moviesData.movies;
  theaters = theatersData.theaters;

  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:1.5rem">
      <h3>Shows (${shows.length})</h3>
      <button class="btn btn-primary btn-sm" id="addShow">+ Add Show</button>
    </div>
    <div class="admin-table-wrap glass-card" style="padding:1rem;max-height:500px;overflow-y:auto">
      <table class="admin-table">
        <thead><tr><th>Movie</th><th>Theater</th><th>Date</th><th>Time</th><th>Price</th><th></th></tr></thead>
        <tbody>${shows.slice(0, 50).map((s) => `
          <tr>
            <td>${s.movie?.title}</td><td>${s.theater?.name}</td>
            <td>${formatDate(s.date)}</td><td>${s.startTime}</td><td>${formatCurrency(s.price)}</td>
            <td><button class="btn btn-danger btn-sm" data-del-show="${s._id}">Delete</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  document.getElementById('addShow').onclick = () => {
    openModal(`
      <div class="modal-header"><h3>Add Show</h3><button class="modal-close" onclick="closeModal()">×</button></div>
      <form id="showForm">
        <div class="form-group"><label>Movie</label>
          <select class="form-control" name="movie" required>${movies.map((m) => `<option value="${m._id}">${m.title}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label>Theater</label>
          <select class="form-control" name="theater" required>${theaters.map((t) => `<option value="${t._id}">${t.name}</option>`).join('')}</select>
        </div>
        <div class="form-group"><label>Date</label><input type="date" class="form-control" name="date" required></div>
        <div class="form-group"><label>Start Time</label><input class="form-control" name="startTime" placeholder="7:30 PM" required></div>
        <div class="form-group"><label>Price</label><input type="number" step="0.01" class="form-control" name="price" value="12.99" required></div>
        <button type="submit" class="btn btn-primary btn-block">Save</button>
      </form>`);
    document.getElementById('showForm').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      await API.post('/shows', {
        movie: fd.get('movie'),
        theater: fd.get('theater'),
        date: fd.get('date'),
        startTime: fd.get('startTime'),
        price: Number(fd.get('price')),
      });
      Toast.success('Show added');
      closeModal();
      loadPanel('shows');
    };
  };

  document.querySelectorAll('[data-del-show]').forEach((btn) => {
    btn.onclick = async () => {
      if (!confirm('Delete show?')) return;
      await API.delete(`/shows/${btn.dataset.delShow}`);
      Toast.success('Deleted');
      loadPanel('shows');
    };
  });
}

async function renderBookingsAdmin(el) {
  const { bookings } = await API.get('/bookings');
  el.innerHTML = `
    <h3 style="margin-bottom:1rem">All Bookings</h3>
    <div class="admin-table-wrap glass-card" style="padding:1rem">
      <table class="admin-table">
        <thead><tr><th>Code</th><th>User</th><th>Movie</th><th>Seats</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>${bookings.map((b) => `
          <tr>
            <td>${b.bookingCode}</td><td>${b.user?.name}</td><td>${b.movie?.title}</td>
            <td>${b.seats?.join(', ')}</td><td>${formatCurrency(b.totalAmount)}</td>
            <td><span class="ticket-status ${b.status}">${b.status}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

window.closeModal = closeModal;
loadPanel('analytics');
