const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  title: String,
  definition: String,
  analogy: String,
  code: String,
  table: mongoose.Schema.Types.Mixed 
});

const curriculumSchema = new mongoose.Schema({
  subtopicId: { type: String, required: true, unique: true }, 
  topic: String,
  description: String,
  sections: [sectionSchema]
});

module.exports = mongoose.model('Curriculum', curriculumSchema);