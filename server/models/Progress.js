const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoId: { type: String, required: true },
  watchedIntervals: [{
    start: { type: Number, required: true },
    end: { type: Number, required: true }
  }],
  totalProgress: { type: Number, default: 0 },
  lastPosition: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Progress', progressSchema);
