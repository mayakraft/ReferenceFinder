'use strict';
module.exports = function(app) {
	var refFinder = require('../controllers/controller');

	app.route('/').get(refFinder.listServices);

	app.route('/point')
	.get(refFinder.solvePoint)
	.post(refFinder.postPoint);
};
