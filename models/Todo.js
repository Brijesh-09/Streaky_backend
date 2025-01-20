const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    taskName: { type: String, required: true },  // taskName is required
    streak: { type: Number, default: 0 },
    addedDate: { type: Date, default: Date.now },
    contributions: [{
        contribution: { type: String }, // The actual contribution data
        date: { type: Date, default: Date.now } // Timestamp of when the contribution was made
      }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Todo', todoSchema);
