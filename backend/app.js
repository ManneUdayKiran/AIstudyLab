var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const chatRouter = require('./routes/chat');
const quizRouter = require('./routes/quiz');
const adminRouter = require('./routes/admin');
const dataImportRouter = require('./routes/dataImport');
const progressRouter = require('./routes/progress');

var app = express();

app.use(cors({
  origin: 'https://a-istudy-lab.vercel.app', // or '*' for all origins (not recommended for production)
  credentials: true // if you use cookies/auth
}));

app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/admin', adminRouter);
app.use('/api/data', dataImportRouter);
app.use('/api/dataImport', dataImportRouter);
app.use('/api/progress', progressRouter);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});
console.log(process.env.PORT);

module.exports = app;
