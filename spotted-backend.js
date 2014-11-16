var async = require('async');

// setup

var context = {};
context.settings = require('./settings');
async.series([setupDatabase, setupApp, listen], ready); // do these things in order!

function setupDatabase(callback) {
	context.db = require('./database');
	context.db.init(context, callback);
}

function setupApp(callback) {
  context.app = require('./app');
  context.app.init(context, callback);
}

function listen(callback) {
  context.app.listen(context.settings.portNum);
  callback(null); // don't do anything
}

function ready(err)
{
  if (err)
  {
    throw err;
  }
  console.log('All ready!');
}