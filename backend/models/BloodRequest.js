const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide patient ID']
  },
  bloodType: {
    type: String,
    enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    required: [true, 'Please specify blood type']
  },
  units: {
    type: Number,
    required: [true, 'Please specify number of units'],
    min: 1,
    max: 10
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  reason: String,
  hospital: {
    type: String,
    required: [true, 'Please specify hospital name']
  },
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  requestedDonors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  acceptedDonor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  neededBy: {
    type: Date,
    required: [true, 'Please specify needed by date']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
