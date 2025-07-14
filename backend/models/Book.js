const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  name: { type: String }, // Book_Name
  price: { type: String }, // Book_Price
  author: { type: String }, // Book_Author
  rating: { type: Number }, // Book_Rating
  release_date: { type: String }, // Book_release_date
  image: { type: String }, // Book_Image (URL)
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema); 