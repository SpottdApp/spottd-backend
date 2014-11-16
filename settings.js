module.exports.portNum = process.env.PORT || 3000;
module.exports.mongoPort = 27017;
module.exports.mongoURI = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/images';);