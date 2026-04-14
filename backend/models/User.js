const mongoose = require('mongoose');

const unlockedNodeSchema = new mongoose.Schema({
  nodeId: { type: String, required: true },
  lastReviewed: { type: Date, default: Date.now }
}, { _id: false }); 

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  enrollmentNo: { type: String, required: true, unique: true },
  rank: { type: String, default: "UNASSIGNED" },
  currentLevel: { type: Number, default: 0 },
  unlockedNodes: [unlockedNodeSchema], 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);