const express = require('express');
const router = express.Router();
const Curriculum = require('../models/Curriculum');

router.get('/:subtopicId', async (req, res) => {
  try {
    const { subtopicId } = req.params;
    const data = await Curriculum.findOne({ subtopicId });
    
    if (!data) {
      return res.status(404).json({ message: "Subtopic not found in database." });
    }
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;