'use strict';
var database = require('./database.js');
var instructions = require('./instructions.js');

var validLanguageCodes = ['en','es','pt'];

exports.listServices = function(req, res, next) {
	res.json({'instructions':'specify the location of a point or a line (two collinear points)', 'example-1':'https://reference-finder.herokuapp.com/point?x=0.5&y=0.25', 'example-2':'https://reference-finder.herokuapp.com/line?x1=0.5&y1=0.25&x2=0.75&y2=0.0'});
};
exports.post = function(req, res, next){
	res.json({"message":"post doesn't do anything"});
};
exports.solvePoint = function(req, res, next){
	var count = countFromQuery(req.query);
	var point = pointFromQuery(req.query);
	var lang = languageFromQuery(req.query);
	if(point == undefined){
		res.json({'error':'please check your point parameters. example \'point?x=0.5&y=0.25\''});
		return;
	}
	if(count == undefined){ count = 5; }
	if(point != undefined){
		database.solutionsForPoint(point, count, function(data){
			var result = data.map(function(d){ return instructions.makeInstructions(d, lang); },this);
			res.json(result);
		});
	}
};
exports.solveLine = function(req, res, next){
	var count = countFromQuery(req.query);
	var line = lineFromQuery(req.query);
	var lang = languageFromQuery(req.query);
	if(line == undefined){
		res.json({'error':'please check your line parameters. example \'line?x1=0.5&y1=0.25&x2=0.0&y2=1.0\''});
		return;
	}
	if(count == undefined){ count = 5; }
	if (line != undefined){
		database.solutionsForLine(line, count, function(data){
			var result = data.map(function(d){ return instructions.makeInstructions(d, lang); },this);
			res.json(result);
		});
	}
};

var convertLine = function(x1, y1, x2, y2){
	// u = (p2 - p1).Normalize().Rotate90();
	// d = p1.Dot(u);
	var dXin = x2 - x1;
	var dYin = y2 - y1;
	var mag = Math.sqrt(dXin * dXin + dYin * dYin);
	// rotate by 90 degrees: switch x and y and make y negative
	// var ux = -(dYin / mag);
	// var uy = (dXin / mag);
	var ux = (dYin / mag);
	var uy = -(dXin / mag);
	var d = x1 * ux + y1 * uy;
	if(d < 0){
		ux = -(dYin / mag);
		uy = (dXin / mag);
		d = x1 * ux + y1 * uy;
	}
	return {'d':d, 'u':{'x':ux, 'y':uy}};
}

function pointFromQuery(query){
	if(query == undefined){ return; }
	var queryX = query.x, queryY = query.y;
	if(queryX == undefined || queryY == undefined){ return; }
	var x = parseFloat(queryX), y = parseFloat(queryY);
	if(isNaN(x) || isNaN(y)){ return; }
	return {'x':x,'y':y};
}
function lineFromQuery(query){
	if(query == undefined){ return; }
	var queryX1 = query.x1, queryY1 = query.y1, queryX2 = query.x2, queryY2 = query.y2;
	if(queryX1==undefined || queryY1==undefined || queryX2==undefined || queryY2==undefined){return;}
	var x1 = parseFloat(queryX1),
	    y1 = parseFloat(queryY1),
	    x2 = parseFloat(queryX2),
	    y2 = parseFloat(queryY2);
	if(isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)){ return; }
	return convertLine(x1, y1, x2, y2);
}
function countFromQuery(query){
	if(query == undefined){ return; }
	var query = parseInt(query.count);
	if(isNaN(query)){ return; }
	if(query <= 0){ query = 1; }
	if(query > 36){ query = 36; }
	return query;
}
function languageFromQuery(query){
	if(query == undefined){ return; }
	var lang;
	if(query.lang != undefined){ lang = query.lang; }
	if(query.language != undefined){ lang = query.language; }
	// check if language is supported
	var valid = (validLanguageCodes.filter(function(el){ return el == lang; }).length > 0);
	if(lang == undefined || !valid){ lang = "en"; }
	return lang;
}
