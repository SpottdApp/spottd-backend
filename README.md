###Run locally
- Create a `.env` file of KEY=VALUE pairs with the variables from `heroku config`
- Start on port 5000 with foreman using `nf start`

###HTTP Requests

####POST /s3/upload
send 'file=' in request body, like this:
	curl -i -F name=test -F file=@sloth.jpg http://localhost:5000/s3/upload

####GET /images/all
returns array of image IDs and URLs

####GET images/:id
.png file