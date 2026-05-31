const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    genre: [{ type: String, required: true }],
    language: { type: String, required: true },
    duration: { type: Number, required: true },
    rating: { type: Number, default: 0, min: 0, max: 10 },
    poster: { type: String, required: true },
    backdrop: { type: String, default: '' },
    trailer: { type: String, default: '' },
    cast: [{ name: String, role: String, image: String }],
    releaseDate: { type: Date, required: true },
    status: { type: String, enum: ['now_showing', 'coming_soon', 'ended'], default: 'now_showing' },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    price: { type: Number, default: 12.99 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
