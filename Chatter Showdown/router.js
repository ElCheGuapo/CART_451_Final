const express = require('express');
var router = express.Router(); 

router.get('/mainPage', function(req, res){
    res.sendFile(__dirname + '/public/html/main.html');
});

router.post('/mainPage', function(req, res){
    res.send('POST index');
});

router.get('/', function(req, res){
    res.sendFile(__dirname + '/public/html/main.html');
});

router.post('/', function(req, res){
    res.send('POST index');
});

//export this router to use in our index.js
module.exports = router;