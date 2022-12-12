const express = require('express');
var router = express.Router(); 
var leaderboard = require('./server.js')

router.get('/about', function(req, res){
    res.render('leaderboard', { leaderboard: leaderboard});
});

module.exports = router;