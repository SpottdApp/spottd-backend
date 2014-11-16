/**
 * Module dependencies
 */
 
var express = require("express");

var fs = require('fs');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var settings = require('./settings')
 
// img path
var imgPath = './sloth2.jpg';
 
// connect to MongoDB
mongoose.connect(settings.mongoURI, 'images');
 
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

   server.listen(3000, function (err) {
     if (err) {
       console.error(err);
     } else {
       console.error('press CTRL+C to exit');
     }
   });
});