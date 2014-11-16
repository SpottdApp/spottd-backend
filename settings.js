module.exports.portNum = process.env.PORT || 3000;
module.exports.mongoPort = 27017;
module.exports.mongoURI = (process.env.MONGOLAB_URI ? ('mongodb://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@ds053090.mongolab.com:53090/heroku_app31656433') :  ('localhost'));