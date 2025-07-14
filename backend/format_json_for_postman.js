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

console.log('✅ Formatted JSON created for Postman!');
console.log('📁 File: computer_science_qa_postman.json');
console.log('📊 Questions: ' + originalData.length);
console.log('');
console.log('📋 Copy the content of computer_science_qa_postman.json to Postman body');
console.log('🔗 Endpoint: POST http://localhost:3000/api/data/questions/json'); 