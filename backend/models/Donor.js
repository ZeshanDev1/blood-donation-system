const mongoose = require('mongoose');

const donationHistorySchema = new mongoose.Schema({
  // recipientName is intentionally optional to avoid storing identifying info
  recipientName: {
    type: String,
  },
  bloodGroup: {
    type: String,
    enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    required: [true, 'Please specify blood group']
  },
  donationDate: {
    type: Date,
    required: [true, 'Please provide donation date']
  },
  // hospitalName is optional to allow minimal records
  hospitalName: {
    type: String,
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  notes: String
}, { _id: false });

const donorSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide full name']
  },
  qimsId: {
    type: String,
  },
  department: {
    type: String,
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Please specify gender']
  },
  age: {
    type: Number,
    min: [18, 'Age must be 18 or above'],
    required: [true, 'Please provide age']
  },
  bloodGroup: {
    type: String,
    enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    required: [true, 'Please specify blood group']
  },
  city: {
    type: String,
    required: [true, 'Please provide city']
  },
  area: {
    type: String,
    required: [true, 'Please provide area']
  },
  availability: {
    type: String,
    enum: ['available', 'unavailable'],
    default: 'available'
  },
  lastDonationDate: Date,
  donationHistory: [donationHistorySchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donor', donorSchema);
