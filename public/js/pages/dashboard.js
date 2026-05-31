document.getElementById('navbar').innerHTML = renderNavbar('dashboard');
document.getElementById('footer').innerHTML = renderFooter();
initNavbar();

if (!Auth.requireAuth()) throw new Error('auth');

let bookings = [];
let activeTab = 'tickets';

async function loadBookings() {
  try {
    const data = await API.get('/bookings/my');
    bookings = data.bookings;
    renderTab(activeTab);
  } catch (err) {
    Toast.error(err.message);
  } finally {
    hideLoader();
  }
}

function renderTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.sidebar-nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.tab === tab);
  });

  const el = document.getElementById('dashboardContent');

  if (tab === 'profile') {
    const user = API.getUser();
    el.innerHTML = `
      <div class="glass-card" style="padding:2rem">
        <h2 class="section-title" style="font-size:1.5rem;margin-bottom:1.5rem">Profile Settings</h2>
        <form id="profileForm">
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="profileName" class="form-control" value="${user?.name || ''}" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" class="form-control" value="${user?.email || ''}" disabled>
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="tel" id="profilePhone" class="form-control" value="${user?.phone || ''}">
          </div>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
      </div>`;
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const data = await API.put('/auth/profile', {
          name: document.getElementById('profileName').value,
          phone: document.getElementById('profilePhone').value,
        });
        API.setUser(data.user);
        Toast.success('Profile updated');
        document.getElementById('navbar').innerHTML = renderNavbar('dashboard');
      } catch (err) {
        Toast.error(err.message);
      }
    });
    return;
  }

  const filtered = tab === 'tickets'
    ? bookings.filter((b) => b.status === 'confirmed' && new Date(b.showDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
    : bookings;

  el.innerHTML = `
    <h2 class="section-title" style="font-size:1.5rem;margin-bottom:1.5rem">
      ${tab === 'tickets' ? 'Upcoming Tickets' : 'Booking History'}
    </h2>
    ${filtered.length ? filtered.map(ticketCardHTML).join('') : '<p class="text-muted glass-card" style="padding:2rem;text-align:center">No bookings yet. <a href="/movies.html" class="auth-link">Browse movies</a></p>'}
  `;

  filtered.filter((b) => b.status === 'confirmed' && b.bookingCode).forEach((b) => {
    const qrEl = document.getElementById(`ticket-qr-${b._id}`);
    if (qrEl && typeof renderQRCode === 'function') {
      renderQRCode(qrEl, buildTicketQrPayload(b));
    }
  });

  document.querySelectorAll('[data-cancel]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Cancel this booking?')) return;
      try {
        await API.patch(`/bookings/${btn.dataset.cancel}/cancel`);
        Toast.success('Booking cancelled');
        loadBookings();
      } catch (err) {
        Toast.error(err.message);
      }
    });
  });
}

function ticketCardHTML(b) {
  const canCancel = b.status === 'confirmed' || b.status === 'pending';
  return `
    <div class="ticket-card glass-card">
      ${movieImgTag(b.movie?.poster, b.movie?.title || 'Movie')}
      <div>
        <h3 style="font-family:var(--font-body);margin-bottom:0.5rem">${b.movie?.title}</h3>
        <p class="text-muted" style="font-size:0.9rem">${b.theater?.name} · ${b.theater?.city}</p>
        <p style="font-size:0.9rem;margin:0.5rem 0">${formatDate(b.showDate)} · ${b.showTime}</p>
        <p>Seats: <span class="text-gold">${b.seats?.join(', ')}</span></p>
        <p style="margin-top:0.5rem"><strong>${formatCurrency(b.totalAmount)}</strong></p>
        ${b.bookingCode ? `<p class="text-muted" style="font-size:0.8rem;margin-top:0.25rem">Code: ${b.bookingCode}</p>` : ''}
        ${b.status === 'confirmed' ? `<a href="/confirmation.html?booking=${b._id}" class="auth-link" style="font-size:0.85rem;display:block;margin-top:0.5rem">Full ticket & QR →</a>` : ''}
      </div>
      ${b.status === 'confirmed' ? `<div class="ticket-qr-wrap" id="ticket-qr-${b._id}" title="Entry QR"></div>` : ''}
      <div style="text-align:right">
        <span class="ticket-status ${b.status}">${b.status}</span>
        ${canCancel && b.status !== 'cancelled' ? `<button class="btn btn-danger btn-sm" style="margin-top:1rem;display:block" data-cancel="${b._id}">Cancel</button>` : ''}
        ${b.status === 'pending' ? `<a href="/payment.html?booking=${b._id}" class="btn btn-primary btn-sm" style="margin-top:0.5rem;display:block">Pay Now →</a>` : ''}
      </div>
    </div>`;
}

document.querySelectorAll('.sidebar-nav a').forEach((a) => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    renderTab(a.dataset.tab);
  });
});

loadBookings();
