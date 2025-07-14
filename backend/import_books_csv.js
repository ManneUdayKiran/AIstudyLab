const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Book = require('./models/Book');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quizapp';
const CSV_PATH = path.join(__dirname, 'merged_dataset.csv', 'merged_dataset.csv');

async function importBooksFromCSV() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const books = [];

  fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', (row) => {
      books.push({
        name: row.Book_Name || '',
        price: row.Book_Price || '',
        author: row.Book_Author || '',
        rating: Number(row.Book_Rating || 0),
        release_date: row.Book_release_date || '',
        image: row.Book_Image || '',
      });
    })
    .on('end', async () => {
      try {
        const result = await Book.insertMany(books, { ordered: false });
        console.log(`Successfully imported ${result.length} books from CSV.`);
      } catch (err) {
        console.error('Error importing books:', err.message);
      } finally {
        mongoose.disconnect();
      }
    });
}

importBooksFromCSV(); 