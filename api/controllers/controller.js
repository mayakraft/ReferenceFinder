'use strict';
var database = require('./database.js');
var instructions = require('./instructions.js');

exports.listServices = function(req, res) {
	res.json({'point':'specify a point in a unit square and this will calculate a folding sequence to find the point. \'point?x=0.5&y=0.25\''});
};
exports.postPoint = function(req, res){
	res.json({"message":"post doesn't do anything"});
};
exports.solvePoint = function(req, res){
	var point = pointFromQuery(req.query);
	if(point == undefined){
		res.json({'error':'please specify a point in a url query. \'point?x=0.5&y=0.25\''});
		return;
	}
	database.solutionsForPoint(point, 2, function(data){
		var result = data.map(function(d){ return instructions.makeInstructions(d); },this);
		res.json(result);
	});
};

function pointFromQuery(query){
	if(query == undefined){ return; }
	var queryX = query.x, queryY = query.y;
	if(queryX == undefined || queryY == undefined){ return; }
	var x = parseFloat(queryX), y = parseFloat(queryY);
	if(isNaN(x) || isNaN(y)){ return; }
	return {'x':x,'y':y};
}

