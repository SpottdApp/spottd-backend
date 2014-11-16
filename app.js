var express = require('express');
var bodyParser = require('body-parser');
var cool = require('cool-ascii-faces');
var database = require('./database');

var app = new express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json

var context;

module.exports.init = function(context, callback) {
	module.context = context;
	callback(null);
}

module.exports.listen = function(portNum) {
	app.listen(portNum);
	console.log("Now listening on port: " + module.context.settings.portNum);
}

// routes

// app.get('/', function(req, res){
// 	res.json('info at: https://github.com/LyfeCycle/lyfecycle-api');
// });

// app.get('/locations', function(req, res){
// 	module.context.db.allLocations(req, res);
// });

// app.post('/locations', function(req, res){
// 	module.context.db.addLocation(req, res);
// });

// app.post('/locations/reset', function(req, res){
// 	module.context.db.reset(req, res);
// });

app.get('/face', function(req, res) {
  res.send(cool());
});