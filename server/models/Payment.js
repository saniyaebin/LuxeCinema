const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['card', 'upi', 'wallet'], default: 'card' },
    cardLast4: String,
    transactionId: { type: String, unique: true },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
  },
  { timestamps: true }
);

paymentSchema.pre('save', function (next) {
  if (!this.transactionId) {
    this.transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 10000);
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
