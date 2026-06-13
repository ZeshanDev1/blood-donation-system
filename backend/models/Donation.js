const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide donor ID']
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest'
  },
  units: {
    type: Number,
    required: [true, 'Please specify number of units'],
    min: 1,
    max: 1
  },
  donationDate: {
    type: Date,
    required: [true, 'Please specify donation date']
  },
  nextEligibleDate: {
    type: Date,
    required: [true, 'Please calculate next eligible date']
  },
  status: {
    type: String,
    enum: ['completed', 'cancelled'],
    default: 'completed'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', donationSchema);
