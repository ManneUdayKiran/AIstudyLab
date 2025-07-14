const mongoose = require('mongoose');
const fs = require('fs');
const Question = require('./models/Question');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiz-app';

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function importComputerScienceQuestions() {
  try {
    // Read the JSON file
    const jsonData = fs.readFileSync('./computer_science_qa.json', 'utf8');
    const questions = JSON.parse(jsonData);
    
    console.log(`Found ${questions.length} questions to import`);
    
    // Transform the data to match our model structure
    const transformedQuestions = questions.map((item, index) => ({
      subject: 'Computer Science',
      question: item.Question,
      optionA: item.Option_A,
      optionB: item.Option_B,
      optionC: item.Option_C,
      optionD: item.Option_D,
      answer: item.Label,
      category: 'Computer Science',
      difficulty: 'Medium' // Default difficulty, can be adjusted later
    }));
    
    // Clear existing computer science questions (optional - comment out if you want to keep existing)
    console.log('Clearing existing Computer Science questions...');
    await Question.deleteMany({ subject: 'Computer Science' });
    
    // Insert the questions
    console.log('Importing questions...');
    const result = await Question.insertMany(transformedQuestions);
    
    console.log(`Successfully imported ${result.length} Computer Science questions!`);
    
    // Display some statistics
    const totalQuestions = await Question.countDocuments();
    console.log(`Total questions in database: ${totalQuestions}`);
    
    // Show sample of imported questions
    const sampleQuestions = await Question.find({ subject: 'Computer Science' }).limit(3);
    console.log('\nSample imported questions:');
    sampleQuestions.forEach((q, index) => {
      console.log(`\n${index + 1}. ${q.question.substring(0, 50)}...`);
      console.log(`   Answer: ${q.answer}`);
    });
    
  } catch (error) {
    console.error('Error importing questions:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the import
async function main() {
  await connectToDatabase();
  await importComputerScienceQuestions();
}

main().catch(console.error); 