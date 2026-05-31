document.getElementById('navbar').innerHTML = renderNavbar();
initNavbar();

if (!Auth.requireAuth()) throw new Error('auth');

const showId = new URLSearchParams(window.location.search).get('show');
let showData = null;
let selectedSeats = [];
const ROWS = 8;
const COLS = 12;
const PREMIUM_ROWS = [1, 2];

async function loadSeats() {
  if (!showId) {
    window.location.href = '/movies.html';
    return;
  }

  try {
    const { show } = await API.get(`/shows/${showId}`);
    showData = show;
    const movie = show.movie;
    const theater = show.theater;

    document.getElementById('seatTitle').textContent = movie.title;
    document.getElementById('seatSubtitle').textContent =
      `${theater.name} · ${formatDate(show.date)} · ${show.startTime} · ${formatCurrency(show.price)}/seat`;

    const booked = new Set(show.bookedSeats || []);
    const grid = document.getElementById('seatGrid');
    grid.innerHTML = '';

    for (let r = 0; r < ROWS; r++) {
      const rowLabel = String.fromCharCode(65 + r);
      const rowDiv = document.createElement('div');
      rowDiv.className = 'seat-row';

      const label = document.createElement('span');
      label.className = 'row-label';
      label.textContent = rowLabel;
      rowDiv.appendChild(label);

      for (let c = 1; c <= COLS; c++) {
        const seatId = `${rowLabel}${c}`;
        const btn = document.createElement('button');
        btn.className = 'seat';
        btn.dataset.seat = seatId;
        btn.title = seatId;

        const isPremium = PREMIUM_ROWS.includes(r + 1);
        if (booked.has(seatId)) {
          btn.classList.add('booked');
          btn.disabled = true;
        } else {
          btn.classList.add('available');
          if (isPremium) btn.classList.add('premium');
          btn.addEventListener('click', () => toggleSeat(btn, seatId));
        }
        rowDiv.appendChild(btn);
      }

      const labelR = document.createElement('span');
      labelR.className = 'row-label';
      labelR.textContent = rowLabel;
      rowDiv.appendChild(labelR);
      grid.appendChild(rowDiv);
    }
  } catch (err) {
    Toast.error(err.message);
  } finally {
    hideLoader();
  }
}

function toggleSeat(btn, seatId) {
  const idx = selectedSeats.indexOf(seatId);
  if (idx >= 0) {
    selectedSeats.splice(idx, 1);
    btn.classList.remove('selected');
  } else {
    if (selectedSeats.length >= 10) {
      Toast.error('Maximum 10 seats per booking');
      return;
    }
    selectedSeats.push(seatId);
    btn.classList.add('selected');
  }
  updateSummary();
}

function updateSummary() {
  const bar = document.getElementById('summaryBar');
  if (!selectedSeats.length) {
    bar.style.display = 'none';
    return;
  }
  bar.style.display = 'flex';
  const count = selectedSeats.length;
  const total = count * showData.price;
  document.getElementById('selectedSeatsText').textContent = `${count} seat${count > 1 ? 's' : ''} selected`;
  document.getElementById('seatList').textContent = selectedSeats.sort().join(', ');
  document.getElementById('totalPrice').textContent = formatCurrency(total);
}

document.getElementById('proceedBtn').addEventListener('click', async () => {
  if (!selectedSeats.length) return;
  const btn = document.getElementById('proceedBtn');
  btn.disabled = true;
  btn.textContent = 'Reserving...';
  try {
    const { booking } = await API.post('/bookings', { showId, seats: selectedSeats });
    sessionStorage.setItem('pendingBooking', JSON.stringify(booking));
    window.location.href = `/payment.html?booking=${booking._id}`;
  } catch (err) {
    Toast.error(err.message);
    btn.disabled = false;
    btn.textContent = 'Proceed to Payment';
  }
});

loadSeats();
