const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    taskName: { type: String, required: true },  // taskName is required
    streak: { type: Number, default: 0 },
    addedDate: { type: Date, default: Date.now },
    contributions: { type: Array, default: [] },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Todo', todoSchema);
