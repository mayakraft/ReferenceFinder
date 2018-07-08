'use strict';
module.exports = function(app) {
	var refFinder = require('../controllers/controller');
	
	// app.all('/', function(req, res, next) {
	// 	res.header("Access-Control-Allow-Origin", "*");
	// 	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	// 	next();
	// });

	app.route('/').get(refFinder.listServices);

	app.route('/point')
		.get(refFinder.solvePoint)
		.post(refFinder.post);

	// app.listen(80, function () {
	// 	console.log('CORS-enabled web server listening on port 80')
	// })

};
