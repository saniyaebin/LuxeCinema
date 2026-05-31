/** Generate QR codes for payment and tickets (works offline from CDN library) */
function renderQRCode(container, text) {
  if (!container) return Promise.resolve();
  container.innerHTML = '';
  const payload = String(text).slice(0, 800);

  return new Promise((resolve) => {
    const done = (el) => {
      if (el) {
        el.alt = 'QR Code';
        el.style.borderRadius = '12px';
        el.style.display = 'block';
        el.style.margin = '0 auto';
        container.appendChild(el);
      }
      resolve();
    };

    const showImgFallback = () => {
      const img = document.createElement('img');
      img.width = 220;
      img.height = 220;
      img.src = `https://quickchart.io/qr?text=${encodeURIComponent(payload)}&size=220&margin=2&dark=1a0a2e&light=f5f5f7`;
      img.onload = () => done(img);
      img.onerror = () => {
        const img2 = document.createElement('img');
        img2.width = 220;
        img2.height = 220;
        img2.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payload)}`;
        img2.onload = () => done(img2);
        img2.onerror = () => {
          container.innerHTML = `<div class="qr-fallback-text" style="padding:1rem;text-align:center;font-family:monospace;font-size:0.75rem;word-break:break-all;color:var(--gold)">${payload.slice(0, 120)}…</div>`;
          resolve();
        };
      };
    };

    if (typeof QRCode !== 'undefined') {
      const canvas = document.createElement('canvas');
      QRCode.toCanvas(canvas, payload, {
        width: 220,
        margin: 2,
        color: { dark: '#d4af37', light: '#141223' },
      })
        .then(() => done(canvas))
        .catch(() => showImgFallback());
    } else {
      showImgFallback();
    }
  });
}

function buildPaymentQrPayload(booking) {
  return JSON.stringify({
    app: 'LuxeCinema',
    type: 'payment',
    bookingId: booking._id,
    code: booking.bookingCode || '',
    amount: booking.totalAmount,
    movie: booking.movie?.title,
  });
}

function buildTicketQrPayload(booking) {
  return JSON.stringify({
    app: 'LuxeCinema',
    type: 'ticket',
    code: booking.bookingCode,
    seats: booking.seats,
    movie: booking.movie?.title,
    theater: booking.theater?.name,
    date: booking.showDate,
    time: booking.showTime,
  });
}

window.renderQRCode = renderQRCode;
window.buildPaymentQrPayload = buildPaymentQrPayload;
window.buildTicketQrPayload = buildTicketQrPayload;
