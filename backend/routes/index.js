var express = require('express');
var router = express.Router();
const dataImportRouter = require('./dataImport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.use('/data', dataImportRouter);

module.exports = router;
