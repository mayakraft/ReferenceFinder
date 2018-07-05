'use strict';
module.exports = function(app) {
	var refFinder = require('../controllers/controller');

	// app.route('/test')
	// .get(refFinder.getAThing)
	// .post(refFinder.doAThing);

	app.route('/point')
	.get(refFinder.getPoint)
	.post(refFinder.postPoint);


	// refFinder Routes
	// app.route('/tasks')
	// .get(refFinder.list_all_tasks)
	// .post(refFinder.create_a_task);


	// app.route('/tasks/:taskId')
	// .get(refFinder.read_a_task)
	// .put(refFinder.update_a_task)
	// .delete(refFinder.delete_a_task);
};
