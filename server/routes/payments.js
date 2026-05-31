const express = require('express');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const { protect } = require('../middleware/auth');

const router = express.Router();

// POST /api/payments - mock payment processing
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, method, cardNumber, cardName } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (booking.status === 'confirmed') {
      return res.status(400).json({ success: false, message: 'Booking already paid.' });
    }

    // Mock validation
    if (method === 'card') {
      const cleaned = (cardNumber || '').replace(/\s/g, '');
      if (cleaned.length < 15) {
        return res.status(400).json({ success: false, message: 'Invalid card number.' });
      }
      if (!cardName?.trim()) {
        return res.status(400).json({ success: false, message: 'Cardholder name required.' });
      }
    }

    const show = await Show.findById(booking.show);
    const unavailable = booking.seats.filter((s) => show.bookedSeats.includes(s));
    if (unavailable.length) {
      booking.status = 'cancelled';
      await booking.save();
      return res.status(400).json({
        success: false,
        message: 'Selected seats are no longer available. Please book again.',
      });
    }

    // Reserve seats
    show.bookedSeats.push(...booking.seats);
    await show.save();

    booking.status = 'confirmed';
    await booking.save();

    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.totalAmount,
      method: method || 'card',
      cardLast4: cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : undefined,
      status: 'success',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie', 'title poster')
      .populate('theater', 'name location')
      .populate('show');

    res.json({
      success: true,
      message: 'Payment successful!',
      payment,
      booking: populatedBooking,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
