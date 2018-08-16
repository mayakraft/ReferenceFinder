# Reference Finder

### [finder.origami.tools](https://finder.origami.tools)

This is a recode of Robert Lang's [Reference Finder](http://langorigami.com/article/referencefinder) originally written in C++. The source was made to export an Sqlite database of the calculator data. By querying the database this service is able to replicate the experience of using the original app. A new front end was built in [Rabbit Ear](https://rabbitear.org).

# API

the api is currently hosted at [https://reference-finder.herokuapp.com/](https://reference-finder.herokuapp.com/)

## Queries

* **point** queries require (float) parameters "x" and "y"
* **line** queries require (float) parameters "x1", "y1", "x2", "y2", location of 2 collinear points

by default, 5 solutions

* **count** is an optional (int) parameter to request up to 36 solutions

by default, instructions are in English

* **lang** is an optional string parameter, specify a language by its ISO 639-1 code. `lang=es` will print instructions in Spanish. (Only certain languages are supported, see api/languages folder for support).

## Languages

The directory `api/languages` contains the currently supported languages, if you do not see your language and would like to contribute a translation, fill out the [translation document](https://raw.githubusercontent.com/robbykraft/ReferenceFinder/master/translation.txt) and email it to robbykraft at gmail. (or if you're capable, create a .json, as in `api/languages`, and do a pull request. this will save me some work!)


## Response

API responds with a JSON array, an ordered list of solutions, sorted from most accurate to least. Each solution is an object with keys:

* **components**: array of every line and mark involved in this fold sequence
* **error**: number, the result of the distance calculation (0 means 100% accurate)
* **target**: point / line - the user input
* **solution**: point / line that this solution is presenting
* **sequence**: step by step folding sequence as a set of parameters and axioms, indices point to indices in **components** array
* **instructions**: step by step folding sequence as a written language

## Example

**API**/point?x=0.5&y=0.333333333333&count=2

``` javascript
[
  {
    "components":[
      {"type":"line","name":"the right edge","d":1,"u":{"x":1,"y":0}},
      {"type":"line","name":"the left edge","d":0,"u":{"x":-1,"y":0}},
      {"type":"line","name":"the bottom edge","d":0,"u":{"x":0,"y":1}},
      {"type":"point","name":"the top right corner","x":1,"y":1},
      {"type":"line","name":"A","d":0.5,"u":{"x":1,"y":0}},
      {"type":"line","name":"B","d":0.25,"u":{"x":1,"y":0}},
      {"type":"point","name":"C","x":0.25,"y":0},
      {"type":"line","name":"D","d":0.2,"u":{"x":0.8,"y":-0.6}},
      {"type":"point","name":"E","x":0.5,"y":0.3333333333333}
    ],
    "error":0,
    "target":{"x":0.5,"y":0.333333333333},
    "solution":{"x":0.5,"y":0.3333333333333},
    "sequence":[
      {"type":"line","make":4,"name":"A","axiom":3,"parameters":{"lines":[0,1]}},
      {"type":"line","make":5,"name":"B","axiom":3,"parameters":{"lines":[1,4]}},
      {"type":"point","make":6,"name":"C","parameters":{"lines":[2,5]}},
      {"type":"line","make":7,"name":"D","axiom":1,"parameters":{"points":[3,6]}},
      {"type":"point","make":8,"name":"E","parameters":{"lines":[4,7]}}
    ],
    "instructions":[
      "make crease A by bringing the right edge to the left edge",
      "make crease B by bringing the left edge to A",
      "point C is the intersection of the bottom edge and B",
      "make crease D by folding through the top right corner and C",
      "the solution is at the intersection of A and D"
    ]
  },
  {
    "components":[
      {"type":"line","name":"the left edge","d":0,"u":{"x":-1,"y":0}},
      {"type":"line","name":"the right edge","d":1,"u":{"x":1,"y":0}},
      {"type":"line","name":"the top edge","d":1,"u":{"x":0,"y":1}},
      {"type":"point","name":"the bottom left corner","x":0,"y":0},
      {"type":"line","name":"A","d":0.5,"u":{"x":1,"y":0}},
      {"type":"point","name":"B","x":0.5,"y":1},
      {"type":"line","name":"C","d":0.5590169943749,"u":{"x":0.4472135955,"y":0.8944271909999}},
      {"type":"line","name":"D","d":0.9163671973669,"u":{"x":0.850650808352,"y":0.5257311121191}},
      {"type":"point","name":"E","x":0.5,"y":0.9340169943749},
      {"type":"line","name":"F","d":0.5297140138276,"u":{"x":0.4719527772988,"y":0.881623829079}},
      {"type":"point","name":"G","x":0.5,"y":0.3331779558239}
    ],
    "error":0.000155377509,
    "target":{"x":0.5,"y":0.333333333333},
    "solution":{"x":0.5,"y":0.3331779558239},
    "sequence":[
      {"type":"line","make":4,"name":"A","axiom":3,"parameters":{"lines":[1,0]}},
      {"type":"point","make":5,"name":"B","parameters":{"lines":[2,4]}},
      {"type":"line","make":6,"name":"C","axiom":2,"parameters":{"points":[3,5]}},
      {"type":"line","make":7,"name":"D","axiom":3,"parameters":{"lines":[1,6]}},
      {"type":"point","make":8,"name":"E","parameters":{"lines":[4,7]}},
      {"type":"line","make":9,"name":"F","axiom":2,"parameters":{"points":[3,8]}},
      {"type":"point","make":10,"name":"G","parameters":{"lines":[4,9]}}
    ],
    "instructions":[
      "make crease A by bringing the right edge to the left edge",
      "point B is the intersection of the top edge and A",
      "make crease C by bringing the bottom left corner to B",
      "make crease D by bringing the right edge to C",
      "point E is the intersection of A and D",
      "make crease F by bringing the bottom left corner to E",
      "the solution is at the intersection of A and F"
    ]
  }
]
```

# License

GPL 3.0
