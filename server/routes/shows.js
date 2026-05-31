const express = require('express');
const Show = require('../models/Show');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/shows?movie=id&date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const { movie, theater, date } = req.query;
    const filter = {};
    if (movie) filter.movie = movie;
    if (theater) filter.theater = theater;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    const shows = await Show.find(filter)
      .populate('movie', 'title poster duration rating genre')
      .populate('theater', 'name location city seatLayout')
      .sort({ date: 1, startTime: 1 });

    res.json({ success: true, shows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theater');
    if (!show) return res.status(404).json({ success: false, message: 'Show not found.' });
    res.json({ success: true, show });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const show = await Show.create(req.body);
    const populated = await Show.findById(show._id).populate('movie').populate('theater');
    res.status(201).json({ success: true, show: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('movie')
      .populate('theater');
    if (!show) return res.status(404).json({ success: false, message: 'Show not found.' });
    res.json({ success: true, show });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Show.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Show deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
