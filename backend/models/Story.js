const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a story title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a story description'],
    trim: true,
  },
  imageUrl: {
    type: String,
    required: [true, 'Please upload a story image'],
  },
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);
