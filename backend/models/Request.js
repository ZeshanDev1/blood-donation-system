const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  recipientName: {
    type: String,
    required: [true, 'Please provide recipient name']
  },
  qimsId: { type: String },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other', ''] },
  department: { type: String },
  contactNumber: {
    type: String,
    required: [true, 'Please provide contact number']
  },
  bloodGroup: {
    type: String,
    enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    required: [true, 'Please specify blood group needed']
  },
  unitsRequired: {
    type: Number,
    required: [true, 'Please specify units required'],
    min: 1,
    max: 10
  },
  hospitalName: {
    type: String,
    required: [true, 'Please provide hospital name']
  },
  city: {
    type: String,
    required: [true, 'Please provide city']
  },
  area: {
    type: String,
    required: [true, 'Please provide area']
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'cancelled'],
    default: 'pending'
  },
  assignedDonor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor'
  },
  fulfilledAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Request', requestSchema);
