const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'Please provide your city'],
    trim: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    required: [true, 'Please specify your gender'],
  },
  age: {
    type: Number,
    required: [true, 'Please provide your age'],
    min: [16, 'Must be at least 16 years old'],
  },
  occupation: {
    type: String,
    required: [true, 'Please provide your occupation'],
    trim: true,
  },
  skills: {
    type: [String],
    enum: ['Event Management', 'Social Media', 'Public Speaking', 'Medical Support', 'Fundraising', 'Other'],
    validate: {
      validator: (v) => v.length > 0,
      message: 'Please select at least one skill',
    },
  },
  previousExperience: {
    type: Boolean,
    required: [true, 'Please indicate previous volunteering experience'],
  },
  organizationName: {
    type: String,
    trim: true,
  },
  consent: {
    type: Boolean,
    required: [true, 'Consent is required'],
    validate: {
      validator: (v) => v === true,
      message: 'You must agree to the consent terms',
    },
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);
