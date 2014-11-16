var express = require("express");
var fs = require('fs');
var mongoose = require('mongoose');
var AWS = require('aws-sdk');
var Schema = mongoose.Schema;
var settings = require('./settings');
 
// mongodb 
mongoose.connect(settings.mongoImagesURI, function(err, res){
  if (err) {
    console.log(err)
  }
});

// AWS S3
var AWS_params = {
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY
}; 
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

AWS.config.update(AWS_params);
AWS.config.update({region:'us-west-2'});
var s3 = new AWS.S3(AWS.config); // should be already configged from .env variables
 
// schema for an image
var imageSchema = new Schema({
    img: {contentType: String, s3Url: String}
});
 
// image model
var IMG = mongoose.model('IMG', imageSchema);
 
// while connection is on
mongoose.connection.on('open', function () {
  console.error('mongo is open');

  // start a demo server
  var server = express();
  server.use(express.bodyParser());

  server.get('/test', function (req, res) {
    res.json('hi');
  });

  server.post('/s3/upload', function(req, res) {
    var file = req.files.file;
    var filename = (file.name).replace(/ /g, '-');
    uploadFile(filename, filename);
    res.send(filename);
  });

  server.get('/images/all', function (req, res) { // returns 100 image ids
    array = [];
    IMG.find().select().limit(100).sort('-_id').exec(function(err, items){
      for (var i=0; i<items.length; i++){
        array.push([items[i]._id, items[i].img.s3Url]);
      }
      res.send(array);
      console.log('rendered all ' + items.length + ' images');
    });
  });

  server.get('/images/:id', function (req, res) {
    imageID = req.param("id");
    IMG.findById(imageID, function(err, image){
      res.json(image.img.s3Url);
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

function uploadFile(remoteFilename, localFileName) {
  var fileBuffer = fs.readFileSync(localFileName);
  var metaData = 'image/jpg';
  // make new model instance
  var newImage = new IMG;
  newImage.img.contentType = 'image/jpg';
  // upload file it to s3
  s3.putObject({
    ACL: 'public-read',
    Bucket: process.env.S3_BUCKET,
    Key: remoteFilename,
    Body: fileBuffer,
    ContentType: metaData
  }, function(err, response) {
    if (err) return err;
    console.log('uploaded file [' + localFileName + '] to [' + remoteFilename + '] as [' + metaData + ']');
    var params = {Bucket: process.env.S3_BUCKET, Key: remoteFilename};
    s3.getSignedUrl('getObject', params, function (err, url) {
      if (err) throw err;
      newImage.img.s3Url = url;
      // now that we have a url, save the image
      newImage.save(function (err, a) {
        if (err) throw err;
        console.error('saved image!');
      });
    });
  });
}
