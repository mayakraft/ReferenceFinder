'use strict';

var sqlite3 = require('sqlite3').verbose();

// the callback function to populate the res json
var finishedTrace = undefined; 

// results stored here
var ranks = [];
// timer to detect when recursion is finished
var finishTimer;
// memoization.  contains entire line object
var visitedMarks = [];
var visitedLines = [];

function validateQueryString(query){
	if(query == undefined){ return; }
	var queryX = query.x, queryY = query.y;
	if(queryX == undefined || queryY == undefined){ return; }
	var x = parseFloat(queryX), y = parseFloat(queryY);
	if(isNaN(x) || isNaN(y)){ return; }
	return {'x':x,'y':y};
}

function resetApp(){
	ranks = Array.apply(null, Array(6)).map(function(el){return {'lines':[],'marks':[]};});
	visitedMarks = [];
	visitedLines = [];
	finishTimer = undefined;
}

exports.getPoint = function(req, res){
	var point = validateQueryString(req.query);
	if(point==undefined){res.json({'error':'please specify a point in a url query. \'point?x=0.5&y=0.25\''});return;}
	// ask database for points
	queryDatabase(point, function(points, error){
		// console.log(points);
		// res.json({"points":points});
		resetApp();
		finishedTrace = function(){
			var data = {'target':points[0],'ranks':ranks}
			var instructions = buildSequence(data);
			var blob = flattenRanks(ranks);
			blob['distance'] = points[0].distance;
			blob['target'] = { 'x':points[0].x, 'y':points[0].y };
			blob['instructions'] = instructions;
			res.json(blob);
		}
		tracePath(points[0]);
	});
}

var flattenRanks = function(ranks){
	var marks = [];
	var lines = [];
	ranks.forEach(function(el){
		el.marks.forEach(function(m){ marks.push({"name":m.name,"x":m.x,"y":m.y}); });
		el.lines.forEach(function(l){ lines.push({"name":l.name,"d":l.d,"u":l.u}); });
	});
	// marks.forEach(function(m){ if(m.name == ""){ delete m.name; } });
	// lines.forEach(function(l){ if(l.name == ""){ delete l.name; } });
	return {'lines':lines, 'marks':marks};
}

exports.postPoint = function(req, res){
	console.log("doing a thing");
	res.json({"message":"doing a thing"});
}

var db = new sqlite3.Database('references.db');

// point should be an object {x:__, y:__}
var queryDatabase = function(point, callback){
	// using SQL, extract all points matching within a rect bounding box range
	// then do a proper distance calculation, return top 10 matches
	var EPSILON = 0.01;
	// todo, at the boundaries shift so the rectangle is fully contained in the unit square
	var xLow =  point.x - EPSILON;
	var xHigh = point.x + EPSILON;
	var yLow =  point.y - EPSILON;
	var yHigh = point.y + EPSILON;
	db.serialize(function(){
		var points = [];
		db.each("SELECT Key, Name, Rank, X, Y, Line1, Line2 FROM Marks WHERE X BETWEEN " + xLow + " AND " + xHigh + " AND Y BETWEEN " + yLow + " AND " + yHigh, function(err, row){
			points.push({'key':row.Key, 'name':row.Name, 'rank':row.Rank, 'x':row.X, 'y':row.Y, 'lines':[row.Line1, row.Line2].map(function(el){return parseInt(el)}).filter(function(el){return !isNaN(el)})});
		}, function(error, rowCount){
			if(error){ console.log("error"); callback(undefined, error) }
			var sortedPoints = pointsByDistance(point, points);
			if(callback){ callback(sortedPoints); }
		});
	});
}

var pointsByDistance = function(point, points, count){
	if(count == undefined){ count = 10; }
	var dist = function(p1,p2){return Math.sqrt(Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2));}
	points.forEach(function(data){ data['distance'] = dist(point, {x:data.x, y:data.y}) });
	points.sort(function(a,b){ return a.distance-b.distance; });
	return points.slice(0,count);
}

var tracePath = function(data){
	if(finishTimer != undefined){ clearTimeout(finishTimer); }
	finishTimer = setTimeout(finishedTrace, 100);

	if(data.lines != undefined){
		data.lines.forEach(function(lineKey){
			db.each("SELECT Key, Name, Axiom, Rank, D, UX, UY, Mark1, Mark2, Line1, Line2 FROM Lines WHERE Key == " + lineKey, function(err, row){
				var nextLine = {
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
					tracePath(nextLine);
				}
			});
		});
	}
	if(data.marks != undefined){
		data.marks.forEach(function(markKey){
			db.each("SELECT Key, Name, Rank, X, Y, Line1, Line2 FROM Marks WHERE Key == " + markKey, function(err, row){
				var nextMark = {
					'key':row.Key, 
					'name':row.Name, 
					'rank':row.Rank, 
					'x':row.X, 
					'y':row.Y, 
					'lines':[row.Line1, row.Line2].map(function(el){return parseInt(el)}).filter(function(el){return !isNaN(el)})};
				if(visitedMarks.filter(function(visitedMark){ return visitedMark.key == nextMark.key }).length == 0){
					visitedMarks.push(nextMark);
					ranks[ nextMark.rank ].marks.push(nextMark);
					tracePath(nextMark);
				}
			});
		});
	}
}


var buildSequence = function(traceResult, completion){
	var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var letterI = 0;
	traceResult.ranks.forEach(function(rankEntry){
		rankEntry.lines.forEach(function(line){
			if(line.name == ""){ line.name = letters[(letterI%letters.length)]; line['instruction'] = true; letterI++; }
		})
		rankEntry.marks.forEach(function(mark){
			if(mark.name == ""){ mark.name = letters[(letterI%letters.length)]; mark['instruction'] = true; letterI++; }
		})
	});
	var instructions = [];
	traceResult.ranks.forEach(function(rankEntry){
		rankEntry.lines
			.filter(function(line){ return line.instruction === true; })
			.forEach(function(line){ instructions.push( writeInstructionLine(line) ); delete line.instruction; })
		rankEntry.marks
			.filter(function(mark){ return mark.instruction === true; })
			.forEach(function(mark){ instructions.push( writeInstructionMark(mark) ); delete mark.instruction;});
	});
	instructions.push( writeFinalInstructionMark(traceResult.target) );
	return instructions;
}

function lineForKey(key){ return visitedLines.filter(function(vl){return vl.key==key;}).shift(); }
function markForKey(key){ return visitedMarks.filter(function(vm){return vm.key==key;}).shift(); }

function writeInstructionLine(line){
	if(line.axiom == ""){ return ""; }
	var lineParams = line.lines.map(function(lineKey){return lineForKey(lineKey);});
	var markParams = line.marks.map(function(markKey){return markForKey(markKey);});
	switch(line.axiom){
		case 1: return "make crease "+line.name+" by folding through points "+markParams[0].name+" and "+markParams[1].name;
		case 2: return "make crease "+line.name+" by bringing point "+markParams[0].name+" to point "+markParams[1].name;
		case 3: return "make crease "+line.name+" by bringing "+lineParams[0].name+" to "+lineParams[1].name;
		case 4: return "make crease "+line.name+" by folding through "+markParams[0].name+" parallel to "+lineParams[1].name;
		case 5: return "make crease "+line.name+" by bringing "+markParams[0].name+" onto "+lineParams[0].name+" passing through "+markParams[1].name;
		case 6: return "make crease "+line.name+" by bringing "+markParams[0].name+" onto "+lineParams[0].name+" and "+markParams[1].name+" onto "+lineParams[1].name;
		case 7: return "make crease "+line.name+" by bringing "+markParams[0].name+" onto "+lineParams[0].name+" creasing perpendicular to "+lineParams[1].name;
	}
}
function writeInstructionMark(mark){
	var lineParams = mark.lines.map(function(lineKey){return lineForKey(lineKey);});
	return "point "+mark.name+" is the intersection of "+lineParams[0].name+" and "+lineParams[1].name;
}
function writeFinalInstructionMark(mark){
	var lineParams = mark.lines.map(function(lineKey){return lineForKey(lineKey);});
	return "the solution is at the intersection of "+lineParams[0].name+" and "+lineParams[1].name;
}


//////////////////////////////////////////////////

// var mongoose = require('mongoose'),
//   Task = mongoose.model('Tasks');

// exports.list_all_tasks = function(req, res) {
//   Task.find({}, function(err, task) {
//     if (err)
//       res.send(err);
//     res.json(task);
//   });
// };




// exports.create_a_task = function(req, res) {
//   var new_task = new Task(req.body);
//   new_task.save(function(err, task) {
//     if (err)
//       res.send(err);
//     res.json(task);
//   });
// };


// exports.read_a_task = function(req, res) {
//   Task.findById(req.params.taskId, function(err, task) {
//     if (err)
//       res.send(err);
//     res.json(task);
//   });
// };


// exports.update_a_task = function(req, res) {
//   Task.findOneAndUpdate({_id: req.params.taskId}, req.body, {new: true}, function(err, task) {
//     if (err)
//       res.send(err);
//     res.json(task);
//   });
// };


// exports.delete_a_task = function(req, res) {
//   Task.remove({
//     _id: req.params.taskId
//   }, function(err, task) {
//     if (err)
//       res.send(err);
//     res.json({ message: 'Task successfully deleted' });
//   });
// };
