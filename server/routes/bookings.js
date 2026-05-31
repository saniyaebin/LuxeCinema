const express = require('express');
const Booking = require('../models/Booking');
const Show = require('../models/Show');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings - create pending booking with seats
router.post('/', protect, async (req, res) => {
  try {
    const { showId, seats } = req.body;
    if (!showId || !seats?.length) {
      return res.status(400).json({ success: false, message: 'Show and seats are required.' });
    }

    const show = await Show.findById(showId).populate('movie').populate('theater');
    if (!show) return res.status(404).json({ success: false, message: 'Show not found.' });

    const unavailable = seats.filter((s) => show.bookedSeats.includes(s));
    if (unavailable.length) {
      return res.status(400).json({
        success: false,
        message: `Seats already booked: ${unavailable.join(', ')}`,
      });
    }

    const totalAmount = seats.length * show.price;

    const booking = await Booking.create({
      user: req.user._id,
      show: show._id,
      movie: show.movie._id,
      theater: show.theater._id,
      seats,
      seatCount: seats.length,
      totalAmount,
      status: 'pending',
      showDate: show.date,
      showTime: show.startTime,
    });

    const populated = await Booking.findById(booking._id)
      .populate('movie', 'title poster')
      .populate('theater', 'name location')
      .populate('show');

    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/my
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title poster genre duration')
      .populate('theater', 'name location city')
      .populate('show', 'startTime date screen')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('movie', 'title')
      .populate('theater', 'name')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('theater')
      .populate('show')
      .populate('user', 'name email');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    const ownerId = booking.user._id ? booking.user._id.toString() : booking.user.toString();
    if (ownerId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Already cancelled.' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const show = await Show.findById(booking.show);
    if (show) {
      show.bookedSeats = show.bookedSeats.filter((s) => !booking.seats.includes(s));
      await show.save();
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
