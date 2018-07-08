'use strict';

var sqlite3 = require('sqlite3').verbose();
var db;

exports.solutionsForPoint = function(point, count, callback){
	db = new sqlite3.Database('references.db');
	getNearestPoints(point, count, function(points, error){
		var masterList = [];
		var callCount = 0;
		points.forEach(function(p){
			callCount++;
			tracePath(p, function(ranks, marks, lines){
				callCount--;
				var entry = {
					'solution':{'x':p.x,'y':p.y},
					'target':point,
					'distance':p.distance,
					'sequence':flattenRanks(ranks),
					'marks':marks,
					'lines':lines
				}
				delete p.distance;
				masterList.push(entry);
				if(callCount == 0){
					db.close();
					masterList.sort(function(a,b){ return a.distance-b.distance; });;
					callback(masterList);
				}
			});
		},this);
	});
}
exports.solutionsForLine = function(line, count, callback){
	db = new sqlite3.Database('references.db');
	getNearestLines(line, count, function(lines, error){
		var masterList = [];
		var callCount = 0;
		lines.forEach(function(l){
			callCount++;
			tracePath(l, function(ranks, marks, lines){
				callCount--;
				var entry = {
					'solution':{'d':l.d, 'u':{'x':l.u.x, 'y':l.u.y}},
					'target':line,
					'distance':l.distance,
					'sequence':flattenRanks(ranks),
					'marks':marks,
					'lines':lines
				}
				delete l.distance;
				masterList.push(entry);
				if(callCount == 0){
					db.close();
					masterList.sort(function(a,b){ return a.distance-b.distance; });;
					callback(masterList);
				}
			});
		},this);
	});
}

var flattenRanks = function(ranks){
	return ranks
		.map(function(rankEntry){ return rankEntry.lines.concat(rankEntry.marks); })
		.reduce(function(prev,curr){ return prev.concat(curr); },[])
}

// point should be an object {x:__, y:__}
// callback is function(points, error), points is an array
var getNearestPoints = function(point, count, callback){
	if(count == undefined){ count = 5; }
	// using SQL, extract all points matching within a rect bounding box range
	// then do a proper distance calculation, return top 5 matches
	var EPSILON = 0.02;
	// todo, at the boundaries shift so the rectangle is fully contained in the unit square
	var xLow =  point.x - EPSILON;
	var xHigh = point.x + EPSILON;
	var yLow =  point.y - EPSILON;
	var yHigh = point.y + EPSILON;
	db.serialize(function(){
		var points = [];
		db.each("SELECT Key, Name, Rank, X, Y, Line1, Line2 FROM Marks WHERE X BETWEEN " + xLow + " AND " + xHigh + " AND Y BETWEEN " + yLow + " AND " + yHigh, function(err, row){
			points.push({'type':'mark', 'key':row.Key, 'name':row.Name, 'rank':row.Rank, 'x':row.X, 'y':row.Y, 'lines':[row.Line1, row.Line2].map(function(el){return parseInt(el)}).filter(function(el){return !isNaN(el)})});
		}, function(error, rowCount){
			if(error){ callback(undefined, error) }
			if(callback){ 
				callback( sortPointsByDistance(point, points).slice(0,count) );
			}
		});
	});
}

// line should be an object {d:___, u:{x:__, y:__}}
// callback is function(lines, error), points is an array
var getNearestLines = function(line, count, callback){
	if(count == undefined){ count = 5; }
	// using SQL, extract all points matching within a rect bounding box range
	// then do a proper distance calculation, return top 5 matches
	var EPSILON = 0.02;
	// todo, at the boundaries shift so the rectangle is fully contained in the unit square
	var xLow =  line.u.x - EPSILON;
	var xHigh = line.u.x + EPSILON;
	var yLow =  line.u.y - EPSILON;
	var yHigh = line.u.y + EPSILON;
	var dLow =  line.d - EPSILON;
	var dHigh = line.d + EPSILON;
	db.serialize(function(){
		var lines = [];
		db.each("SELECT Key, Name, Axiom, Rank, D, UX, UY, Mark1, Mark2, Line1, Line2 FROM Lines WHERE UX BETWEEN " + xLow + " AND " + xHigh + " AND UY BETWEEN " + yLow + " AND " + yHigh + " AND D BETWEEN " + dLow + " AND " + dHigh, function(err, row){
			lines.push({
				'type':'line',
				'key':row.Key, 
				'name':row.Name, 
				'axiom':row.Axiom, 
				'rank':row.Rank, 
				'd':row.D, 
				'u':{'x':row.UX, 'y':row.UY}, 
				'marks':[row.Mark1, row.Mark2].map(function(el){return parseInt(el)}).filter(function(el){return !isNaN(el)}), 
				'lines':[row.Line1, row.Line2].map(function(el){return parseInt(el)}).filter(function(el){return !isNaN(el)})
			});
		}, function(error, rowCount){
			if(error){ callback(undefined, error) }
			if(callback){ 
				callback( sortLinesByDistance(line, lines).slice(0,count) );
			}
		});
	});
}

// callback is function(ranks, marks, lines)
var tracePath = function(point, callback){
	var ranks = Array.apply(null, Array(7)).map(function(el){return {'lines':[],'marks':[]};});
	// mark this point as the target goal
	point['solution'] = true;
	// add first point
	var visitedLines = [];
	var visitedMarks = [point];
	ranks[ point.rank ].marks.push(point);
	// begin recursion
	travelPath(point, ranks, visitedMarks, visitedLines, {marks:0, lines:0}, function(){
		callback(ranks, visitedMarks, visitedLines);
	});
}


var sortPointsByDistance = function(point, points){
	var dist = function(p1,p2){return Math.sqrt(Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2));}
	points.forEach(function(data){ data['distance'] = dist(point, {x:data.x, y:data.y}) });
	return points.sort(function(a,b){ return a.distance-b.distance; });
}

var sortLinesByDistance = function(line, lines){
	var dist = function(a, b, c){ return Math.sqrt(Math.pow(a,2)+Math.pow(b,2)+Math.pow(c,2)); }
	lines.forEach(function(l){ l['distance'] = dist(l.u.x-line.u.x, l.u.y-line.u.y, l.d-line.d); });
	return lines.sort(function(a,b){ return a.distance-b.distance; });
}


var travelPath = function(data, ranks, visitedMarks, visitedLines, callCount, callback){
	// data is the point or line to be found
	// ranks is the return object, passed in argument because of recursion
	// visitedMarks and visitedLines is the memoization, and collected for purposes beyond this function too
	if(data.lines != undefined){
		data.lines.forEach(function(lineKey){
			callCount.lines++;
			db.each("SELECT Key, Name, Axiom, Rank, D, UX, UY, Mark1, Mark2, Line1, Line2 FROM Lines WHERE Key == " + lineKey, function(err, row){
				callCount.lines--;
				var nextLine = {
					'type':'line',
					'key':row.Key, 
					'name':row.Name, 
					'axiom':row.Axiom, 
					'rank':row.Rank, 
					'd':row.D, 
					'u':{'x':row.UX, 'y':row.UY}, 
					'marks':[row.Mark1, row.Mark2].map(function(el){return parseInt(el)}).filter(function(el){return !isNaN(el)}), 
					'lines':[row.Line1, row.Line2].map(function(el){return parseInt(el)}).filter(function(el){return !isNaN(el)})};
				if(visitedLines.filter(function(visitedLine){ return visitedLine.key == nextLine.key }).length == 0){
					visitedLines.push(nextLine);
					ranks[ nextLine.rank ].lines.push(nextLine);
					travelPath(nextLine, ranks, visitedMarks, visitedLines, callCount, callback);
				}
				// if call count reaches 0, call the callback
				if(callCount.marks == 0 && callCount.lines == 0){ callback(); }
			});
		});
	}
	if(data.marks != undefined){
		data.marks.forEach(function(markKey){
			callCount.marks++;
			db.each("SELECT Key, Name, Rank, X, Y, Line1, Line2 FROM Marks WHERE Key == " + markKey, function(err, row){
				callCount.marks--;
				var nextMark = {
					'type':'mark',
					'key':row.Key, 
					'name':row.Name, 
					'rank':row.Rank, 
					'x':row.X, 
					'y':row.Y, 
					'lines':[row.Line1, row.Line2].map(function(el){return parseInt(el)}).filter(function(el){return !isNaN(el)})};
				if(visitedMarks.filter(function(visitedMark){ return visitedMark.key == nextMark.key }).length == 0){
					visitedMarks.push(nextMark);
					ranks[ nextMark.rank ].marks.push(nextMark);
					travelPath(nextMark, ranks, visitedMarks, visitedLines, callCount, callback);
				}
				// if call count reaches 0, call the callback
				if(callCount.marks == 0 && callCount.lines == 0){ callback(); }
			});
		});
	}
}
