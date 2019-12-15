var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Endless Roller | APA!' });
});

router.get('/controller/:id', function(req, res, next) {
  res.render('controller', { title: 'Endless Roller | APA!', id:req.params.id });
});

module.exports = router;
