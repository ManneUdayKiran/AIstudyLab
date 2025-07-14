const Question = require('../models/Question');
const MathQuestion = require('../models/MathQuestion');
const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer');
const path = require('path');
const Book = require('../models/Book');
const Learning = require('../models/Learning');
const MathsLearning = require('../models/MathsLearning');
const DataScienceLearning = require('../models/DataScienceLearning');
const ScienceLearning = require('../models/ScienceLearning');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'), false);
    }
  }
}).single('file');

// Import questions from JSON file path
exports.importQuestionsFromFilePath = async (req, res) => {
  try {
    const { filePath, subject, category, difficulty, clearExisting } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'File path is required'
      });
    }

    // Resolve the file path
    const resolvedPath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath);
    
    console.log(`Attempting to read file from: ${resolvedPath}`);

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
        requestedPath: filePath,
        resolvedPath: resolvedPath
      });
    }

    // Read and parse JSON file
    const fileContent = fs.readFileSync(resolvedPath, 'utf8');
    let questions;
    
    try {
      questions = JSON.parse(fileContent);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON file',
        error: parseError.message
      });
    }

    // Check if it's an array
    if (!Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'JSON file must contain an array of questions'
      });
    }

    console.log(`Found ${questions.length} questions in JSON file`);

    const subjectName = subject || 'Computer Science';
    const categoryName = category || 'Computer Science';
    const difficultyLevel = difficulty || 'Medium';

    // Transform questions to match model structure
    const transformedQuestions = questions.map((item) => ({
      subject: subjectName,
      question: item.Question,
      optionA: item.Option_A,
      optionB: item.Option_B,
      optionC: item.Option_C,
      optionD: item.Option_D,
      answer: item.Label,
      category: categoryName,
      difficulty: difficultyLevel
    }));

    // Clear existing questions if requested
    if (clearExisting) {
      console.log(`Clearing existing ${subjectName} questions...`);
      await Question.deleteMany({ subject: subjectName });
    }

    // Insert the questions
    const insertedQuestions = await Question.insertMany(transformedQuestions);

    res.json({
      success: true,
      message: `Successfully imported ${insertedQuestions.length} questions from file`,
      imported: insertedQuestions.length,
      subject: subjectName,
      category: categoryName,
      difficulty: difficultyLevel,
      filePath: resolvedPath
    });

  } catch (error) {
    console.error('Error importing questions from file path:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing questions',
      error: error.message
    });
  }
};

// Import questions from uploaded CSV file
exports.importQuestionsFromFile = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err) {
        return res.status(400).json({ 
          success: false, 
          message: err.message 
        });
      }

      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }

      const filePath = req.file.path;
      const subject = req.body.subject || 'Computer Science';
      const category = req.body.category || 'Computer Science';
      const difficulty = req.body.difficulty || 'Medium';

      console.log(`Importing questions from: ${filePath}`);
      console.log(`Subject: ${subject}, Category: ${category}, Difficulty: ${difficulty}`);

    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
        .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
            console.log(`Found ${results.length} questions in CSV`);

            // Transform the data to match our model structure
            const transformedQuestions = results.map((item) => ({
              subject: subject,
              question: item.Question,
              optionA: item.Option_A,
              optionB: item.Option_B,
              optionC: item.Option_C,
              optionD: item.Option_D,
              answer: item.Label,
              category: category,
              difficulty: difficulty
            }));

            // Clear existing questions for this subject (optional)
            if (req.body.clearExisting === 'true') {
              console.log(`Clearing existing ${subject} questions...`);
              await Question.deleteMany({ subject: subject });
            }

            // Insert the questions
            const insertedQuestions = await Question.insertMany(transformedQuestions);
            
            // Clean up uploaded file
            fs.unlinkSync(filePath);

          res.json({ 
              success: true,
              message: `Successfully imported ${insertedQuestions.length} questions`,
              imported: insertedQuestions.length,
              subject: subject,
              category: category,
              difficulty: difficulty
            });

          } catch (error) {
            console.error('Error importing questions:', error);
            res.status(500).json({
              success: false,
              message: 'Error importing questions',
              error: error.message
            });
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV:', error);
          res.status(500).json({
            success: false,
            message: 'Error reading CSV file',
            error: error.message
          });
        });
    });
  } catch (error) {
    console.error('Error in importQuestionsFromFile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Import questions from JSON data (for Postman body)
exports.importQuestionsFromJSON = async (req, res) => {
  try {
    const { questions, subject, category, difficulty, clearExisting } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: 'Questions array is required'
      });
    }

    const subjectName = subject || 'Computer Science';
    const categoryName = category || 'Computer Science';
    const difficultyLevel = difficulty || 'Medium';

    console.log(`Importing ${questions.length} questions for subject: ${subjectName}`);

    // Transform questions to match model structure
    const transformedQuestions = questions.map((item) => ({
      subject: subjectName,
      question: item.Question,
      optionA: item.Option_A,
      optionB: item.Option_B,
      optionC: item.Option_C,
      optionD: item.Option_D,
      answer: item.Label,
      category: categoryName,
      difficulty: difficultyLevel
    }));

    // Clear existing questions if requested
    if (clearExisting) {
      console.log(`Clearing existing ${subjectName} questions...`);
      await Question.deleteMany({ subject: subjectName });
    }

    // Insert the questions
    const insertedQuestions = await Question.insertMany(transformedQuestions);
    
    res.json({ 
      success: true,
      message: `Successfully imported ${insertedQuestions.length} questions`,
      imported: insertedQuestions.length,
      subject: subjectName,
      category: categoryName,
      difficulty: difficultyLevel
    });

  } catch (error) {
    console.error('Error importing questions from JSON:', error);
    res.status(500).json({
      success: false,
      message: 'Error importing questions',
      error: error.message
    });
  }
};

// Get import status and statistics
exports.getImportStats = async (req, res) => {
  try {
    const stats = await Question.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 },
          categories: { $addToSet: '$category' },
          difficulties: { $addToSet: '$difficulty' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats,
      totalQuestions: await Question.countDocuments()
    });

  } catch (error) {
    console.error('Error getting import stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting statistics',
      error: error.message
    });
  }
}; 

// Get math/science/history questions
exports.getMathQuestions = async (req, res) => {
  try {
    const { category, limit = 100 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const questions = await MathQuestion.find(filter).limit(parseInt(limit));
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

// Get paginated list of books
exports.getBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      Book.find().skip(skip).limit(limit),
      Book.countDocuments()
    ]);

    res.json({
      success: true,
      page,
      limit,
      total,
      books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    });
  }
}; 

// Get all learning documents
exports.getAllLearning = async (req, res) => {
  try {
    const learningData = await Learning.find({});
    res.json({ success: true, data: learningData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch learning data', error: err.message });
  }
}; 

// Get all maths learning documents
exports.getAllMathsLearning = async (req, res) => {
  try {
    const mathsData = await MathsLearning.find({});
    res.json({ success: true, data: mathsData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch maths learning data', error: err.message });
  }
}; 

// Get all data science learning documents
exports.getAllDataScienceLearning = async (req, res) => {
  try {
    const dsData = await DataScienceLearning.find({});
    res.json({ success: true, data: dsData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch data science learning data', error: err.message });
  }
}; 

// Get all science learning documents
exports.getAllScienceLearning = async (req, res) => {
  try {
    const sciData = await ScienceLearning.find({});
    res.json({ success: true, data: sciData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch science learning data', error: err.message });
  }
}; 