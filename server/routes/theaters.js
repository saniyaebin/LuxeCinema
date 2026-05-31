const express = require('express');
const Theater = require('../models/Theater');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const theaters = await Theater.find().sort({ name: 1 });
    res.json({ success: true, theaters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) return res.status(404).json({ success: false, message: 'Theater not found.' });
    res.json({ success: true, theater });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const theater = await Theater.create(req.body);
    res.status(201).json({ success: true, theater });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!theater) return res.status(404).json({ success: false, message: 'Theater not found.' });
    res.json({ success: true, theater });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Theater.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Theater deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
