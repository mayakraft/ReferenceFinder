'use strict';

exports.axiom = function(axiom){
	switch(axiom){
		case 1: return "Haga el pliegue <X> doblando entre <P0> y <P1>."
		case 2: return "Haga el pliegue <X> llevando <P0> a <P1>."
		case 3: return "Haga el pliegue <X> llevando <L0> a <L1>."
		case 4: return "Haga el pliegue <X> que pasa por <P0> llevando <L0> sobre ella misma."
		case 5: return "Haga que el pliegue <X> pase por <P1> llevando <P0> a <L0>."
		case 6: return "Haga el pliegue <X> llevando <P0> a <L0> y <P1> a <L1>."
		case 7: return "Haga el pliegue <X> que lleva <P0> a <L0> llevando <L1> sobre ella misma. "
	}
}
exports.axiomFinal = function(axiom){
	switch(axiom){
		case 1: return "La solución se logra plegando entre <P0> y <P1>."
		case 2: return "La solución se logra llevando <P0> a <P1>."
		case 3: return "La solución se logra llevando <L0> a <L1>."
		case 4: return "La solución se logra llevando <L0> sobre ella misma, pasando por <P0>."
		case 5: return "La solución se logra llevando <P0> a <L0>, pasando por <P1>."
		case 6: return "La solución se logra llevando <P0> a <L1> y <P0> a <L1>."
		case 7: return "La solución se logra llevando <L1> sobre ella misma y llevando <P0> a <L0>."
	}
}
exports.intersection = function(){ return "<X> es la intersección de <L0> y <L1>."; }
exports.intersectionFinal = function(){ return "La solución es la intersección de <L0> y <L1>."; }

exports.parts = {
	"the top left corner" : "la esquina superior izquierda",
	"the bottom left corner" : "la esquina inferior izquierda",
	"the top right corner" : "la esquina superior derecha",
	"the bottom right corner" : "la esquina inferior derecha ",
	"the top edge" : "el borde superior",
	"the bottom edge" : "el borde inferior",
	"the left edge" : "el borde izquierdo",
	"the right edge" : "el borde derecho",
	"the upward diagonal" : "la diagonal que va hacia arriba",
	"the downward diagonal" : "la diagonal que va hacia abajo "
};

exports.findMark = "encuentre un punto";
exports.findLine = "encuentre una línea";
exports.solution = "solución";




