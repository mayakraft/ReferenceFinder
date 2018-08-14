'use strict';

var localize;

exports.makeInstructions = function(data, language){
	if(language == undefined){ language = 'en'; }
	localize = require("../languages/"+language+".js");
	nameComponents(data.sequence);
	var result = {};
	result['components'] = getComponents(data.sequence);
	result['error'] = cleanNumber(data.distance, 12);
	result['target'] = data.target;
	result['solution'] = data.solution;
	result['sequence'] = cleanSequence(data.sequence, data.marks, data.lines);
	result['instructions'] = makeWrittenInstructions(data.sequence, data.marks, data.lines);
	return result;
}

function cleanNumber(num, decimalPlaces){
	if(num == undefined){ return undefined; }
	if(Math.floor(num) == num || decimalPlaces == undefined){ return num; }
	return parseFloat(num.toFixed(decimalPlaces));
}

var cleanSequence = function(data, marks, lines){
	return data.filter(function(el){ return el.instruction == true; })
		.map(function(el){
			if(el.type == 'line'){
				var index = data.findIndex(obj => obj.key == el.key && obj.type=='line');
				var lineIndices = el.lines.map(function(lineKey){return data.findIndex(obj => obj.key == lineKey && obj.type=='line');})
				var markIndices = el.marks.map(function(markKey){return data.findIndex(obj => obj.key == markKey && obj.type=='mark');})
				var parameters = {};
				if(markIndices.length){ parameters['points'] = markIndices; }
				if(lineIndices.length){ parameters['lines'] = lineIndices; }
				return {'type':'line','make':index,'name':el.name,'axiom':el.axiom,'parameters':parameters};
			}
			if(el.type == 'mark'){
				var index = data.findIndex(obj => obj.key == el.key && obj.type=='mark');
				var lineIndices = el.lines.map(function(lineKey){return data.findIndex(obj => obj.key == lineKey && obj.type=='line');})
				return {'type':'point','make':index,'name':el.name,'parameters':{'lines':lineIndices}};
			}
		},this);
}

var getComponents = function(data){
	return data.map(function(el){
		if(el.type == 'line'){ return {'type':'line','name':el.name,'d':el.d,'u':el.u}; }
		if(el.type == 'mark'){ return {'type':'point','name':el.name,'x':el.x,'y':el.y}; }
	});
}

var nameComponents = function(data){
	var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var letterI = 0;
	// translate alread-named components
	data.filter(function(el){ return el.name != ""; })
		.forEach(function(el){ el.name = localize.parts[el.name]; })

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
			if(i == instructionData.length-1){ 
				if(el.type=='mark'){ return writeFinalInstructionMark(el, marks, lines); }
				if(el.type=='line'){ return writeFinalInstructionLine(el, marks, lines); }
			}
			if(el.type == 'line'){ return writeInstructionLine(el, marks, lines); }
			if(el.type == 'mark'){ return writeInstructionMark(el, marks, lines); }
		},this);
}

function lineForKey(key, lines){ return lines.filter(function(vl){return vl.key==key;}).shift(); }
function markForKey(key, marks){ return marks.filter(function(vm){return vm.key==key;}).shift(); }

function writeInstructionLine(line, marks, lines){
	if(line.axiom == ""){ return ""; }
	var instruction = localize.axiom(line.axiom);
	instruction = instruction.replace("<X>", line.name);
	line.marks
		.map(function(markKey){return markForKey(markKey, marks);})
		.forEach(function(m,i){ instruction = instruction.replace("<P"+i+">",m.name); },this);
	line.lines
		.map(function(lineKey){return lineForKey(lineKey, lines);})
		.forEach(function(l,i){ instruction = instruction.replace("<L"+i+">",l.name); },this);
	return instruction;
}

function writeInstructionMark(mark, marks, lines){
	var instruction = localize.intersection();
	instruction = instruction.replace("<X>", mark.name);
	mark.lines
		.map(function(lineKey){return lineForKey(lineKey, lines);})
		.forEach(function(l,i){ instruction = instruction.replace("<L"+i+">",l.name); },this);
	return instruction;
}

function writeFinalInstructionMark(mark, marks, lines){
	var instruction = localize.intersectionFinal();
	mark.lines
		.map(function(lineKey){return lineForKey(lineKey, lines);})
		.forEach(function(l,i){ instruction = instruction.replace("<L"+i+">",l.name); },this);
	return instruction;
}

function writeFinalInstructionLine(line, marks, lines){
	if(line.axiom == ""){ return ""; }
	var instruction = localize.axiomFinal(line.axiom);
	line.marks
		.map(function(markKey){return markForKey(markKey, marks);})
		.forEach(function(m,i){ instruction = instruction.replace("<P"+i+">",m.name); },this);
	line.lines
		.map(function(lineKey){return lineForKey(lineKey, lines);})
		.forEach(function(l,i){ instruction = instruction.replace("<L"+i+">",l.name); },this);
	return instruction;
}