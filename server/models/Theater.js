const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    screens: { type: Number, default: 1 },
    amenities: [String],
    seatLayout: {
      rows: { type: Number, default: 8 },
      cols: { type: Number, default: 12 },
      premiumRows: { type: [Number], default: [1, 2] },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Theater', theaterSchema);
