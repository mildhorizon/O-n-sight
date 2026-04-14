const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Curriculum = require('./models/Curriculum');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.log(err));

const seedDatabase = async () => {
  try {
    await Curriculum.deleteMany();
    console.log('Cleared existing curriculum data.');

    const dataPath = path.join(__dirname, 'data');
    const files = fs.readdirSync(dataPath);

    for (const file of files) {
      if (file.endsWith('.json')) {
        const rawData = fs.readFileSync(path.join(dataPath, file));
        const jsonData = JSON.parse(rawData);

        const subtopicName = file.replace('.json', '').replace(/_/g, ' ');

        const newDoc = new Curriculum({
          subtopicId: subtopicName,
          topic: jsonData.topic,
          description: jsonData.description,
          sections: jsonData.sections
        });

        await newDoc.save();
        console.log(`Uploaded: ${subtopicName}`);
      }
    }

    console.log('Curriculum Seeding Complete!');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();