document.getElementById('navbar').innerHTML = renderNavbar();
initNavbar();

if (!Auth.requireAuth()) throw new Error('auth');

const bookingId = new URLSearchParams(window.location.search).get('booking');
let currentBooking = null;

function formatCardNumber(value) {
  const v = value.replace(/\D/g, '').slice(0, 16);
  return v.replace(/(.{4})/g, '$1 ').trim();
}

async function processPayment(method, extra = {}) {
  const btn = document.getElementById('payBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Processing...';
  }
  try {
    const data = await API.post('/payments', {
      bookingId,
      method,
      ...extra,
    });
    sessionStorage.setItem('lastBooking', JSON.stringify(data.booking));
    Toast.success('Payment successful!');
    setTimeout(() => {
      window.location.href = `/confirmation.html?booking=${bookingId}`;
    }, 800);
  } catch (err) {
    Toast.error(err.message);
    if (btn) {
      btn.disabled = false;
      btn.textContent = method === 'upi' ? 'Confirm UPI Payment' : `Pay ${formatCurrency(currentBooking.totalAmount)}`;
    }
  }
}

function switchPaymentTab(tab) {
  document.querySelectorAll('.payment-tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  document.querySelectorAll('.payment-panel').forEach((p) => {
    p.classList.toggle('active', p.dataset.panel === tab);
  });
  if (tab === 'upi' && currentBooking) {
    const el = document.getElementById('paymentQr');
    if (el && !el.dataset.rendered) {
      renderQRCode(el, buildPaymentQrPayload(currentBooking)).then(() => {
        el.dataset.rendered = '1';
      });
    }
  }
}

async function loadPayment() {
  if (!bookingId) {
    window.location.href = '/dashboard.html';
    return;
  }

  try {
    const { booking } = await API.get(`/bookings/${bookingId}`);
    currentBooking = booking;

    if (booking.status === 'confirmed') {
      window.location.href = `/confirmation.html?booking=${bookingId}`;
      return;
    }

    document.getElementById('paymentContent').innerHTML = `
      <div class="card-form glass-card">
        <h2 style="margin-bottom:0.5rem">Complete Payment</h2>
        <p class="text-muted" style="margin-bottom:1.5rem;font-size:0.9rem">Choose card, UPI QR scan, or wallet (mock — no real charge)</p>

        <div class="payment-tabs">
          <button type="button" class="payment-tab active" data-tab="card">💳 Card</button>
          <button type="button" class="payment-tab" data-tab="upi">📱 UPI / QR</button>
          <button type="button" class="payment-tab" data-tab="wallet">👛 Wallet</button>
        </div>

        <div class="payment-panel active" data-panel="card">
          <div class="card-preview">
            <div class="chip"></div>
            <div class="number" id="cardPreviewNum">•••• •••• •••• ••••</div>
            <div>
              <div style="font-size:0.75rem;color:var(--text-muted)">CARDHOLDER</div>
              <div id="cardPreviewName">YOUR NAME</div>
            </div>
          </div>
          <form id="paymentForm">
            <div class="form-group">
              <label>Card Number</label>
              <input type="text" id="cardNumber" class="form-control" placeholder="4242 4242 4242 4242" maxlength="19" required>
            </div>
            <div class="form-group">
              <label>Cardholder Name</label>
              <input type="text" id="cardName" class="form-control" placeholder="John Doe" required>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form-group">
                <label>Expiry</label>
                <input type="text" id="expiry" class="form-control" placeholder="MM/YY" maxlength="5" required>
              </div>
              <div class="form-group">
                <label>CVV</label>
                <input type="text" id="cvv" class="form-control" placeholder="123" maxlength="4" required>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-block" id="payBtn">Pay ${formatCurrency(booking.totalAmount)}</button>
          </form>
        </div>

        <div class="payment-panel" data-panel="upi">
          <div class="qr-payment-box">
            <p class="text-gold" style="font-weight:600;margin-bottom:0.5rem">Scan to pay ${formatCurrency(booking.totalAmount)}</p>
            <p class="text-muted" style="font-size:0.85rem;margin-bottom:1rem">UPI ID: <strong>luxecinema@upi</strong></p>
            <div id="paymentQr"></div>
            <p class="text-muted" style="font-size:0.8rem">Scan with any UPI app (demo). Then tap confirm below.</p>
          </div>
          <button type="button" class="btn btn-primary btn-lg btn-block" id="upiPayBtn">Confirm UPI Payment</button>
        </div>

        <div class="payment-panel" data-panel="wallet">
          <div class="glass-card" style="padding:1.5rem;margin-bottom:1rem;text-align:center">
            <p style="font-size:2rem;margin-bottom:0.5rem">👛</p>
            <p><strong>LuxeCinema Wallet</strong></p>
            <p class="text-muted" style="font-size:0.9rem;margin:0.5rem 0 1rem">Balance: ${formatCurrency(250)} (demo)</p>
          </div>
          <button type="button" class="btn btn-primary btn-lg btn-block" id="walletPayBtn">Pay with Wallet</button>
        </div>
      </div>

      <div class="booking-summary glass-card">
        <h3 style="margin-bottom:1rem">Booking Summary</h3>
        <div class="summary-row"><span>Movie</span><span>${booking.movie?.title || '—'}</span></div>
        <div class="summary-row"><span>Theater</span><span>${booking.theater?.name || '—'}</span></div>
        <div class="summary-row"><span>Date</span><span>${formatDate(booking.showDate)}</span></div>
        <div class="summary-row"><span>Time</span><span>${booking.showTime}</span></div>
        <div class="summary-row"><span>Seats</span><span>${booking.seats?.join(', ')}</span></div>
        <div class="summary-row"><span>Tickets</span><span>${booking.seatCount}</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatCurrency(booking.totalAmount)}</span></div>
        <div class="summary-qr-block" style="margin-top:1.5rem;padding-top:1.5rem;border-top:1px solid var(--border-glass);text-align:center">
          <p class="text-gold" style="font-weight:600;font-size:0.9rem;margin-bottom:0.5rem">Scan to Pay (UPI)</p>
          <div id="summaryPaymentQr"></div>
          <p class="text-muted" style="font-size:0.75rem;margin-top:0.5rem">luxecinema@upi · or use Card / Wallet tabs</p>
        </div>
      </div>`;

    await renderQRCode(document.getElementById('summaryPaymentQr'), buildPaymentQrPayload(booking));

    document.querySelectorAll('.payment-tab').forEach((tab) => {
      tab.addEventListener('click', () => switchPaymentTab(tab.dataset.tab));
    });

    const cardNum = document.getElementById('cardNumber');
    const cardName = document.getElementById('cardName');

    cardNum.addEventListener('input', (e) => {
      e.target.value = formatCardNumber(e.target.value);
      document.getElementById('cardPreviewNum').textContent = e.target.value || '•••• •••• •••• ••••';
    });
    cardName.addEventListener('input', (e) => {
      document.getElementById('cardPreviewName').textContent = e.target.value.toUpperCase() || 'YOUR NAME';
    });
    document.getElementById('expiry').addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
      e.target.value = v;
    });

    document.getElementById('paymentForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await processPayment('card', {
        cardNumber: cardNum.value,
        cardName: cardName.value,
      });
    });

    document.getElementById('upiPayBtn').addEventListener('click', () => processPayment('upi'));
    document.getElementById('walletPayBtn').addEventListener('click', () => processPayment('wallet'));
  } catch (err) {
    Toast.error(err.message);
    setTimeout(() => { window.location.href = '/dashboard.html'; }, 1500);
  } finally {
    hideLoader();
  }
}

loadPayment();
