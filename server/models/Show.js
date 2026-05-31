const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
    screen: { type: String, default: 'Screen 1' },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String },
    price: { type: Number, required: true },
    bookedSeats: [{ type: String }],
    totalSeats: { type: Number, default: 96 },
  },
  { timestamps: true }
);

showSchema.methods.isSeatAvailable = function (seatId) {
  return !this.bookedSeats.includes(seatId);
};

module.exports = mongoose.model('Show', showSchema);
