var express = require("express");
var fs = require('fs');
var mongoose = require('mongoose');
var AWS = require('aws-sdk');
var Schema = mongoose.Schema;
var settings = require('./settings');
 
// AWS S3
var AWS_params = {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
}; 
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

AWS.config.update(AWS_params);
// AWS.config.update({region:'us-west-2'}); // don't use this with s3
var s3 = new AWS.S3(AWS.config); // should be already configged from .env variables
s3.config.update(AWS.config);
 
// schema for an image
var imageSchema = new Schema({
      contentType: String,
      s3Url: String,
      createdAt: { type: Date },
      updatedAt: { type: Date }
});
 
// image model
var IMG = mongoose.model('IMG', imageSchema);
 
// start a server
var server = express();
server.use(express.bodyParser());
server.use(express.bodyParser({uploadDir:'./uploads'}));

// mongodb 
mongoose.connect(settings.mongoImagesURI, function(err, res){
  if (err) {
    console.log(err)
  }
});

// while connection is on, define routes
mongoose.connection.on('open', function () {
  console.error('mongo is open');

  server.get('/test', function (req, res) {
    res.json('hi');
  });

  server.post('/s3/upload', function(req, res) {
    var file = req.files.file;
    var filename = (file.name).replace(/ /g, '-');
    filename = req.files.file.path;
    uploadFile(filename);
    res.send(filename);
  });

  server.get('/images/all', function (req, res) { // returns 100 image ids
    array = [];
    IMG.find().select('_id s3Url createdAt').limit(100).sort('createdAt').exec(function(err, items){
      for (var i=0; i<items.length; i++){
        array.push(items[i]);
      }
      res.send(array);
      console.log('rendered all ' + items.length + ' images');
    });
  });

  server.get('/images/:id', function (req, res) {
    imageID = req.param("id");
    IMG.findById(imageID, function(err, image){
      res.json(image);
    });
  });

  server.delete('/images/delete/:id', function (req, res) {
    imageID = req.param("id");
    console.log('deteing img with id: ' + imageID);
    IMG.find({_id: imageID}).remove().exec();
    res.json("deleted!");
  });

  server.post('/images/:id', function (req, res) {
    imageID = req.param("id");
    IMG.findById(imageID, function(err, image){
      res.json(image);
    });
  });

  // server.post('/reset', function (req, res) {
  //   IMG.remove(function(err){
  //     if (err) throw err;
  //     res.json('reset images!');
  //   });
  // });

  var portNumber = process.env.PORT || 3000;
  server.listen(portNumber, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log("Listening on port " + portNumber);
      console.error('press CTRL+C to exit');
    }
  });
});

function uploadFile(localFileName) {
  console.log('starting file upload...');
  var fileBuffer = fs.readFileSync(localFileName);
  // make new model instance
  var newImage = new IMG;
  var remoteFilename = newImage._id + '.jpg';
  console.log('...to remote file name ' + remoteFilename);
  newImage.contentType = 'image/jpg';
  // upload file to s3
  s3.putObject({
    ACL: 'public-read',
    Bucket: process.env.S3_BUCKET,
    Key: remoteFilename,
    Body: fileBuffer,
    ContentType: newImage.contentType
  }, function(err, response) {
    console.log(AWS_params);
    if (err) {
      console.log(err);
      return err;
    }
    console.log('uploaded file [' + localFileName + '] to [' + remoteFilename + '] as [' + newImage.contentType + ']');
    var params = {Bucket: process.env.S3_BUCKET, Key: remoteFilename};
    s3.getSignedUrl('getObject', params, function (err, url) {
      if (err) return err;
      url = 'https://' + process.env.S3_BUCKET + '.s3-us-west-2.amazonaws.com/' + remoteFilename;
      newImage.s3Url = url;
      newImage.createdAt = new Date();
      // now that we have a url, save the image
      newImage.save(function (err, a) {
        if (err) return err;
        console.error('saved image!');
      });
    });
  });
}
