const express = require('express');
const Movie = require('../models/Movie');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/movies
router.get('/', async (req, res) => {
  try {
    const { search, genre, language, status, featured, trending } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (genre) filter.genre = genre;
    if (language) filter.language = language;
    if (status) filter.status = status;
    if (featured === 'true') filter.featured = true;
    if (trending === 'true') filter.trending = true;
console.log("DB Name:", Movie.db.name);
console.log("Filter:", filter);

const count = await Movie.countDocuments();
console.log("Total Movies In DB:", count);
    const movies = await Movie.find(filter).sort({ releaseDate: -1 });
    res.json({ success: true, count: movies.length, movies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/movies/:id
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' });
    res.json({ success: true, movie });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/movies (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, movie });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/movies/:id (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' });
    res.json({ success: true, movie });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/movies/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' });
    res.json({ success: true, message: 'Movie deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
