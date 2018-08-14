'use strict';

exports.axiom = function(axiom){
	switch(axiom){
		case 1: return "Make crease <X> by folding through <P0> and <P1>."
		case 2: return "Make crease <X> by bringing <P0> to <P1>."
		case 3: return "Make crease <X> by bringing <L0> to <L1>."
		case 4: return "Make crease <X> by bringing <L0> onto itself, passing through <P0>."
		case 5: return "Make crease <X> by bringing <P0> to <L0>, passing through <P1>."
		case 6: return "Make crease <X> by bringing <P0> to <L0> and <P1> to <L1>."
		case 7: return "Make crease <X> by bringing <L1> onto itself and bringing <P0> to <L0>."
	}
}
exports.axiomFinal = function(axiom){
	switch(axiom){
		case 1: return "The solution is made by folding through <P0> and <P1>."
		case 2: return "The solution is made by bringing <P0> to <P1>."
		case 3: return "The solution is made by bringing <L0> to <L1>."
		case 4: return "The solution is made by bringing <L0> onto itself, passing through <P0>."
		case 5: return "The solution is made by bringing <P0> to <L0>, passing through <P1>."
		case 6: return "The solution is made by bringing <P0> to <L1> and <P0> to <L1>."
		case 7: return "The solution is made by bringing <L1> onto itself and bringing <P0> to <L0>."
	}
}
exports.intersection = function(){ return "Point <X> is at the intersection of <L0> and <L1>."; }
exports.intersectionFinal = function(){ return "The solution is at the intersection of <L0> and <L1>."; }

exports.parts = {
	"the top left corner" : "the top left corner",
	"the bottom left corner" : "the bottom left corner",
	"the top right corner" : "the top right corner",
	"the bottom right corner" : "the bottom right corner",
	"the top edge" : "the top edge",
	"the bottom edge" : "the bottom edge",
	"the left edge" : "the left edge",
	"the right edge" : "the right edge",
	"the upward diagonal" : "the upward diagonal",
	"the downward diagonal" : "the downward diagonal"
}

exports.findMark = "find a point";
exports.findLine = "find a line";
exports.solution = "solution";
