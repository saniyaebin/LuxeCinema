document.getElementById('navbar').innerHTML = renderNavbar('movies');
document.getElementById('footer').innerHTML = renderFooter();
initNavbar();

let allMovies = [];
const params = new URLSearchParams(window.location.search);
const statusFilter = params.get('status') || '';

async function loadMovies() {
  try {
    const query = statusFilter ? `?status=${statusFilter}` : '';
    const data = await API.get(`/movies${query}`);
    allMovies = data.movies;

    const genres = [...new Set(allMovies.flatMap((m) => m.genre))].sort();
    const languages = [...new Set(allMovies.map((m) => m.language))].sort();

    const genreSelect = document.getElementById('genreFilter');
    genres.forEach((g) => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = g;
      genreSelect.appendChild(opt);
    });

    const langSelect = document.getElementById('languageFilter');
    languages.forEach((l) => {
      const opt = document.createElement('option');
      opt.value = l;
      opt.textContent = l;
      langSelect.appendChild(opt);
    });

    if (statusFilter === 'coming_soon') {
      document.querySelector('.section-title').innerHTML = 'Coming <span class="text-gold">Soon</span>';
    }

    renderMovies(allMovies);
  } catch (err) {
    Toast.error(err.message);
  } finally {
    hideLoader();
  }
}

function renderMovies(movies) {
  const grid = document.getElementById('moviesGrid');
  const empty = document.getElementById('emptyState');

  if (!movies.length) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  grid.innerHTML = movies.map((m) => `
    <div class="movie-list-card glass-card">
      <div class="poster-wrap">
        ${movieImgTag(m.poster, m.title)}
      </div>
      <div class="info">
        <h3>${m.title}</h3>
        <div class="movie-meta-row">
          <span class="rating-badge">★ ${m.rating}</span>
          <span>${m.genre?.join(', ')}</span>
          <span>${m.language}</span>
          <span>${m.duration} min</span>
        </div>
        <a href="/show.html?id=${m._id}" class="btn btn-primary btn-block">Book Now</a>
      </div>
    </div>`).join('');
}

function filterMovies() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const genre = document.getElementById('genreFilter').value;
  const language = document.getElementById('languageFilter').value;

  const filtered = allMovies.filter((m) => {
    const matchSearch = !search || m.title.toLowerCase().includes(search) || m.description.toLowerCase().includes(search);
    const matchGenre = !genre || m.genre.includes(genre);
    const matchLang = !language || m.language === language;
    return matchSearch && matchGenre && matchLang;
  });
  renderMovies(filtered);
}

document.getElementById('searchInput').addEventListener('input', filterMovies);
document.getElementById('genreFilter').addEventListener('change', filterMovies);
document.getElementById('languageFilter').addEventListener('change', filterMovies);

loadMovies();
