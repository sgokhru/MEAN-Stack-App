var express = require('express');
var app = express();
var router = express.Router();
var mongoose = require('mongoose');
var config = require('./config/database');
var path = require('path');
var bodyParser = require('body-parser');
var authentication = require('./routes/authentication')(router);

mongoose.connect(config.uri, function(err) {
    if (err) console.log('could not connect to database');
    else console.log('Connected to database: ' + config.db);
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/client/dist'));

app.use('/authentication', authentication);

app.listen(8080, function(err, data) {
    if (err) console.log(err);
    console.log('Server started')
});