const express = require('express');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Movie = require('../models/Movie');
const Show = require('../models/Show');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect, adminOnly);

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const [totalBookings, confirmedBookings, totalRevenue, totalMovies, totalShows, totalUsers] =
      await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'confirmed' }),
        Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Movie.countDocuments(),
        Show.countDocuments(),
        User.countDocuments({ role: 'user' }),
      ]);

    const recentBookings = await Booking.find({ status: 'confirmed' })
      .populate('movie', 'title')
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      analytics: {
        totalBookings,
        confirmedBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalMovies,
        totalShows,
        totalUsers,
        recentBookings,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
