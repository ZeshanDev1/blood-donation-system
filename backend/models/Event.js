const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide an event description'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide an event date']
  },
  time: {
    type: String,
    required: [true, 'Please provide an event time'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please provide an event location'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Please upload an event image']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);