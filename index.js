var express = require('express');
var app = express();
var mongoose = require('mongoose');
var config = require('./config/database');
var path = require('path');

mongoose.connect(config.uri, function(err) {
    if (err) console.log('could not connect to database');
    else console.log('Connected to database: ' + config.db);
});

app.use(express.static(__dirname + '/client/dist'));
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/client/dist/index.html'));
});

app.listen(8000, function(err, data) {
    if (err) console.log(err);
    console.log('Server started')
});