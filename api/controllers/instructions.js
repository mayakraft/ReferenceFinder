'use strict';

exports.makeInstructions = function(data){
	data.sequence;
	data.marks;
	data.lines;
	nameComponents(data.sequence);
	var result = {};
	result['sequence'] = cleanSequence(data.sequence);
	result['distance'] = data.distance;
	result['solution'] = data.solution;
	result['instructions'] = makeWrittenInstructions(data.sequence, data.marks, data.lines);
	return result;
}

var cleanSequence = function(sequence){
	return sequence.map(function(el){
		if(el.type == 'line'){ return {"name":el.name,"d":el.d,"u":el.u}; }
		if(el.type == 'mark'){ return {"name":el.name,"x":el.x,"y":el.y}; }
	});
}

var nameComponents = function(data){
	var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var letterI = 0;
	data.filter(function(el){ return el.name == ""; })
		.forEach(function(el){
			el.name = letters[(letterI%letters.length)];
			el['instruction'] = true;
			letterI++;
		})
}

var makeWrittenInstructions = function(data, marks, lines){
	// return data
	// 	.filter(function(el){ return el.instruction == true; })
	// 	.map(function(el, i){
	// 		if(el.type == 'line'){ return writeInstructionLine(el, marks, lines); }
	// 		if(el.type == 'mark'){ return writeInstructionMark(el, marks, lines); }
	// 	},this);
	var instructionData = data.filter(function(el){ return el.instruction == true; });
	return instructionData
		.map(function(el, i){
			if(i == instructionData.length-1){ return writeFinalInstructionMark(el, marks, lines); }
			if(el.type == 'line'){ return writeInstructionLine(el, marks, lines); }
			if(el.type == 'mark'){ return writeInstructionMark(el, marks, lines); }
		},this);
}

function lineForKey(key, lines){ return lines.filter(function(vl){return vl.key==key;}).shift(); }
function markForKey(key, marks){ return marks.filter(function(vm){return vm.key==key;}).shift(); }

function writeInstructionLine(line, marks, lines){
	if(line.axiom == ""){ return ""; }
	var lineParams = line.lines.map(function(lineKey){return lineForKey(lineKey, lines);});
	var markParams = line.marks.map(function(markKey){return markForKey(markKey, marks);});
	switch(line.axiom){
		case 1: return "make crease "+line.name+" by folding through "+markParams[0].name+" and "+markParams[1].name;
		case 2: return "make crease "+line.name+" by bringing "+markParams[0].name+" to "+markParams[1].name;
		case 3: return "make crease "+line.name+" by bringing "+lineParams[0].name+" to "+lineParams[1].name;
		case 4: return "make crease "+line.name+" by folding through "+markParams[0].name+" parallel to "+lineParams[1].name;
		case 5: return "make crease "+line.name+" by bringing "+markParams[0].name+" onto "+lineParams[0].name+" passing through "+markParams[1].name;
		case 6: return "make crease "+line.name+" by bringing "+markParams[0].name+" onto "+lineParams[0].name+" and "+markParams[1].name+" onto "+lineParams[1].name;
		case 7: return "make crease "+line.name+" by bringing "+markParams[0].name+" onto "+lineParams[0].name+" creasing perpendicular to "+lineParams[1].name;
	}
}

function writeInstructionMark(mark, marks, lines){
	var lineParams = mark.lines.map(function(lineKey){return lineForKey(lineKey, lines);});
	return "point "+mark.name+" is the intersection of "+lineParams[0].name+" and "+lineParams[1].name;
}

function writeFinalInstructionMark(mark, marks, lines){
	var lineParams = mark.lines.map(function(lineKey){return lineForKey(lineKey, lines);});
	return "the solution is at the intersection of "+lineParams[0].name+" and "+lineParams[1].name;
}

