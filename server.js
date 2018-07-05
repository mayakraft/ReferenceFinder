
var express = require('express'),
	cors = require('cors'),
	app = express(),
	port = process.env.PORT || 3000,
	bodyParser = require('body-parser');

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/routes');
routes(app);

app.listen(port);
console.log('reference finder server started on: ' + port);
