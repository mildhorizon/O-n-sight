const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/create', async (req, res) => {
  try {
    const { name, enrollmentNo, rank } = req.body;

    let user = await User.findOne({ enrollmentNo });
    if (user) {
      return res.status(400).json({ message: "Student already registered in the system." });
    }

    user = new User({
      name,
      enrollmentNo,
      rank,
      currentLevel: 0,
      unlockedNodes: [{ nodeId: "fundamentals", lastReviewed: new Date() }]
    });

    await user.save();
    res.status(201).json({ message: "User successfully registered in WHITE ALBUM.", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.get('/:enrollmentNo', async (req, res) => {
  try {
    const user = await User.findOne({ enrollmentNo: req.params.enrollmentNo });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

router.put('/level-up', async (req, res) => {
  try {
    const { enrollmentNo, currentNodeId, nextNodeId } = req.body;

    let user = await User.findOne({ enrollmentNo });
    if (!user) return res.status(404).json({ message: "User not found." });

    const existingNodeIndex = user.unlockedNodes.findIndex(n => n.nodeId === currentNodeId);
    if (existingNodeIndex !== -1) {
      user.unlockedNodes[existingNodeIndex].lastReviewed = new Date();
    } else {
      user.unlockedNodes.push({ nodeId: currentNodeId, lastReviewed: new Date() });
    }

    if (nextNodeId) {
      const nextExists = user.unlockedNodes.find(n => n.nodeId === nextNodeId);
      if (!nextExists) {
        user.unlockedNodes.push({ nodeId: nextNodeId, lastReviewed: new Date() });
        user.currentLevel += 1; 
      }
    }

    await user.save();
    res.status(200).json({ message: "Mastery updated successfully.", user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;