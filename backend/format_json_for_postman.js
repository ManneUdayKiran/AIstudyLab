const fs = require('fs');

// Read the original JSON file
const originalData = JSON.parse(fs.readFileSync('./computer_science_qa.json', 'utf8'));

// Format for Postman
const postmanFormat = {
  questions: originalData,
  subject: "Computer Science",
  category: "Computer Science",
  difficulty: "Medium",
  clearExisting: true
};

// Write the formatted JSON
fs.writeFileSync('./computer_science_qa_postman.json', JSON.stringify(postmanFormat, null, 2));
