###Run locally
- Create a `.env` file of KEY=VALUE pairs with the variables from `heroku config`
- Start on port 5000 with foreman using `nf start`

###HTTP Requests

####GET /images/all
returns array of all images

####GET /images/nearby
returns array of images with a latidude/longitude near a latitude/longitude passed in the request body

####GET images/:id
url for specific image

####POST /s3/upload
send 'file=' in request body, like this:
	
	curl -i -F name=test -F file=@sloth.jpg http://localhost:5000/s3/upload

####DELETE /images/delete/:id
delete image by id