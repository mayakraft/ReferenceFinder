'use strict';
var database = require('./database.js');
var instructions = require('./instructions.js');

exports.listServices = function(req, res, next) {
	res.json({'instructions':'specify a point in a unit square for a folding sequence to locate the point. \'point?x=0.5&y=0.25\''});
};
exports.post = function(req, res, next){
	res.json({"message":"post doesn't do anything"});
};
exports.solvePoint = function(req, res, next){
	var count = countFromQuery(req.query);
	var point = pointFromQuery(req.query);
	if(point == undefined){
		res.json({'error':'please specify a point in a url query. \'point?x=0.5&y=0.25\''});
		return;
	}
	if(count == undefined){ count = 5; }
	if(point != undefined){
		database.solutionsForPoint(point, count, function(data){
			// console.log(data);
			var result = data.map(function(d){ return instructions.makeInstructions(d); },this);
			res.json(result);
		});
	}
};
exports.solveLine = function(req, res, next){
	var count = countFromQuery(req.query);
	var line = lineFromQuery(req.query);
	if(line == undefined){
		res.json({'error':'please specify a line in a url query. \'line?x1=0.5&y1=0.25&x2=0.0&y2=1.0\''});
		return;
	}
	if(count == undefined){ count = 5; }
	if (line != undefined){
		database.solutionsForLine(line, count, function(data){
			// console.log(data);
			var result = data.map(function(d){ return instructions.makeInstructions(d); },this);
			res.json(result);
		});
	}
};

	// magnitude():number { return Math.sqrt(this.x * this.x + this.y * this.y); }
	// normalize():XY { var m = this.magnitude(); return new XY(this.x/m, this.y/m);}
	// rotate90():XY { return new XY(-this.y, this.x); }
	// dot(point:XY):number { return this.x * point.x + this.y * point.y; }

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
	return query;
}
