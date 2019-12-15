var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  res.io.on('connection', function (socket) {
    console.log('user connected');
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
      console.log(data);
    });
  });
  res.render('index', { title: 'Endless Roller | APA!' });
});

module.exports = router;
