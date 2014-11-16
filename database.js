var mongo = require('mongodb');
var monk = require('monk');
var allgood = require('allgood'),
    valid = allgood.valid;


var context;
var locations;

module.exports.init = function(context, callback) {
    module.context = context;
    console.log('Connecting to mongo at: ' + context.settings.mongoURI);
    db = monk(context.settings.mongoURI);
    locations = db.get('pictures');
    if (!locations) {
        console.log('Pictures database does not exist!');
    }
    callback(null);
}
/*
module.exports.allLocations = function(req, res) {
    locations.find({}, function (err, docs){
        res.json(docs);
    });
}

module.exports.reset = function(req, res) {
 locations.remove({});
 res.send('Reset locations!');
}

module.exports.addLocation = function(req, res) {
    json = req.body;
  if (!valid(locationSchema, json)) {
    console.log('Invalid location!');
    res.json(allgood.problems(locationSchema, json));
  } else {
    newLocation = {"name":json.name, "latitude":json.latitude, "longitude":json.longitude};
    locations.insert(newLocation, function(err, doc){
        console.log('Trying to add a location...');
        if(err) {
            console.log(err);
            res.json(err);
        } else {
            console.log('Success!');
            res.json('Success!');
        }
    });
  }
}
*/
// define the keys we want all locations to have
var locationSchema = {
    "name":"string",
    "latitude":"string",
    "longitude":"string"
};