var express = require("express");
var fs = require('fs');
var busboy = require('connect-busboy'); //middleware for form/file upload
var knox = require('knox');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var settings = require('./settings');
 
// img path
var imgPath = './sloth2.jpg';
 
// mongodb 
mongoose.connect(settings.mongoImagesURI, function(err, res){
  if (err) {
    console.log(err)
  }
});

// AWS S3
var knox_params = {
    key: process.env.AWS_ACCESS_KEY,
    secret: process.env.AWS_SECRET_KEY,
    bucket: process.env.S3_BUCKET,
    endpoint: process.env.S3_BUCKET + '.s3-us-west-2.amazonaws.com'
  };
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
 
// schema for an image
var imageSchema = new Schema({
    img: {data: Buffer, contentType: String}
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
    var client = knox.createClient(knox_params);

    var file = req.files.file;
    var filename = (file.name).replace(/ /g, '-');

    client.putFile(file.path, 'scratch/' + filename, {'Content-Type': file.type, 'x-amz-acl': 'public-read'}, 
      function(err, result) {
        if (err) {
          console.log(err);
          res.send(err); 
        } else {
          if (200 == result.statusCode) { 
            console.log('Uploaded to Amazon S3!');

            // call the resizer function for to different sizes.
            if (process.env.BLITLINE_API_KEY) {
              resizer( filename, 100, 100 );
              resizer( filename, 400, 600 );
            }

            fs.unlink(file.path, function (err) {
              if (err) throw err;
              console.log('successfully deleted /'+file.path); 
            });

          } else { 
            console.log('Failed to upload file to Amazon S3'); 
            console.log(result.statusCode);
          }

          res.send('thanks'); 
        }
    });

  });

  server.post('/upload', function (req, res) {
    var newImage = new IMG;
    imgPath = req.body.path.toString();
    console.log('image path: ' + imgPath);
    newImage.img.data = fs.readFileSync(imgPath);
    newImage.img.contentType = 'image/png';
    newImage.save(function (err, a) {
      if (err) throw err;
      console.error('saved image!');
      res.json('saved image!');
    });
  });

  server.get('/images/ids', function (req, res) { // returns 100 image ids
    ids = [];
    IMG.find().select('_id').limit(100).sort('-_id').exec(function(err, items){
      console.log("found " + items.length + ' images'); 
      console.log(items[0]);
      for (var i=0; i<items.length; i++){
        ids.push(items[i]._id);
        console.log('image id: ' + items[i].id);
      }
      res.send(ids);
      console.log('rendered all ' + items.length + ' images');
    });
  });

  server.get('/images/:id', function (req, res) {
    imageID = req.param("id");
    console.log('looking for image with id: '+ imageID);
    IMG.findById(imageID, function(err, image){
      res.contentType('image/png');
      res.send(image.img.data);
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