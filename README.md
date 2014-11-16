###Run locally
- Create a `.env` file of KEY=VALUE pairs with the variables from `heroku config`
- Start on port 5000 with foreman using `nf start`

###HTTP Requests

####POST /images/upload
send 'path' in request body

####GET /images/ids
returns array of ids

####GET images/:id
.png file