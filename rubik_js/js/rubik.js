/**
 * Rubik's Cube Javascript
 * @author jose.pedro.dias@gmail.com
 * Obtober 2010
 */


// TODO: CORE STUFF


if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun) {
        var len = this.length;
        if (typeof fun != "function")
            throw new TypeError();
    
        var res = new Array();
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this) {
                var val = this[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, this))
                    res.push(val);
            }
        }
    
        return res;
    };
}


function listProperties(obj, showValues, recursive) {
    var propList = '{';
    for (var propName in obj) {
        if (typeof(obj[propName]) != 'undefined') {
            if (!!showValues) {
                propList += propName + ', ';
            }
            else {
                var propVal = obj[propName];
                if ( (typeof(propVal) == 'object') && !!recursive ) {
                    propVal = listProperties(propVal, showValues, recursive);
                }
                else if (typeof(propVal) == 'function') {
                	propVal = 'function';
                }
                propList += propName + ': ' + propVal + ', ';
            }
        }
    }
    if ((propList.length > 2) && (propList[propList.length - 2] == ',')) {
    	propList = propList.substring(0, propList.length - 2);
    }
    propList += '}';
    return propList;
}


function randNum(n) {
    return Math.floor( Math.random() * n );
}



// TODO: Rubik Base
// on shifting 3 axes (six sides) to a 6 positions vector the rationale is:
// +x, -x, +y, -y, +z, -z


// sides
var sides = ['R', 'L', 'U', 'D', 'F', 'B'];

/**
 * sideIndex -> function that returns if cell position vector [0-2, 0-2, 0-2] is part of the given side
 * example:
 *   sideSelectLookup[ sides.indexOf('R') ]( [2, 0, 0] ) returns true;
 */
var sideSelectLookup = [ function(v) {return v[0] == 2;},
                         function(v) {return v[0] == 0;},
                         function(v) {return v[1] == 2;},
                         function(v) {return v[1] == 0;},
                         function(v) {return v[2] == 2;},
                         function(v) {return v[2] == 0;}  ];



// directions
var directions = ['R', 'Ri', 'L', 'Li', 'U', 'Ui', 'D', 'Di', 'F', 'Fi', 'B', 'Bi'];

/**
 * directionIndex -> function that accepts a position and returns the new position it should occupy
 * note: it only makes sense to change positions of cells having passed the filter function given by sideSelectLookup!
 * example:
 *   dirPosShift[ directions.indexOf('r') ]( [2, 0, 1] ) returns [2, 1, 0]
 */
var dirPosShift = [function(v) {return [2,   v[2], 2-v[1]];},
                   function(v) {return [2, 2-v[2],   v[1]];},
                   function(v) {return [0, 2-v[2],   v[1]];},
                   function(v) {return [0,   v[2], 2-v[1]];},
                   
                   function(v) {return [2-v[2], 2,   v[0]];},
                   function(v) {return [  v[2], 2, 2-v[0]];},
                   function(v) {return [  v[2], 0, 2-v[0]];},
                   function(v) {return [2-v[2], 0,   v[0]];},
                   
                   function(v) {return [  v[1], 2-v[0], 2];},
                   function(v) {return [2-v[1],   v[0], 2];},
                   function(v) {return [2-v[1],   v[0], 0];},
                   function(v) {return [  v[1], 2-v[0], 0];}      ];


/**
 * directionIndex -> versor of the 90 rotation (CCW) that has to be applied to a cell
 * example:
 *   dirRotVersor[ directions.indexOf('r') ] returns [1, 0, 0]
 */
var dirRotVersor = [ [-1,  0,  0], [ 1,  0,  0], [ 1,  0,  0], [-1,  0,  0],
                     [ 0, -1,  0], [ 0,  1,  0], [ 0,  1,  0], [ 0, -1,  0],
                     [ 0,  0, -1], [ 0,  0,  1], [ 0,  0,  1], [ 0,  0, -1]       ];

var faceRot = [ {angle:  90, y: 1}, {angle: -90, y: 1},
                {angle: -90, x: 1}, {angle:  90, x: 1},
                {angle:   0, y: 1}, {angle: 180, y: 1} ];
 

/**
 * directionIndex -> function which receives a 6 sided cube and returns the cube with shifted values according to direction
 * note: it only makes sense to change positions of cells having passed the filter function given by sideSelectLookup!
 * example:
 *   dirRotate3[ directions.indexOf('r') ]( [undefined, undefined, undefined, undefined, undefined, undefined] )  returns [1, 0, 0]
 */
var dirSidesShift = [function(v) {return [ v[0], v[1], v[4], v[5], v[3], v[2] ];},
                     function(v) {return [ v[0], v[1], v[5], v[4], v[2], v[3] ];},
                     function(v) {return [ v[0], v[1], v[5], v[4], v[2], v[3] ];},
                     function(v) {return [ v[0], v[1], v[4], v[5], v[3], v[2] ];},
                     
                     function(v) {return [ v[5], v[4], v[2], v[3], v[0], v[1] ];},
                     function(v) {return [ v[4], v[5], v[2], v[3], v[1], v[0] ];},
                     function(v) {return [ v[4], v[5], v[2], v[3], v[1], v[0] ];},
                     function(v) {return [ v[5], v[4], v[2], v[3], v[0], v[1] ];},
                     
                     function(v) {return [ v[2], v[3], v[1], v[0], v[4], v[5] ];},
                     function(v) {return [ v[3], v[2], v[0], v[1], v[4], v[5] ];},
                     function(v) {return [ v[3], v[2], v[0], v[1], v[4], v[5] ];},
                     function(v) {return [ v[2], v[3], v[1], v[0], v[4], v[5] ];}   ];


// colors
var colors = ['O', 'R', 'W', 'Y', 'B', 'G'];
var clrRGB = [ {r: 0.7, g: 0.35},
               {r: 0.6},
               {r: 1, g: 1, b: 1},
               {r: 0.7, g: 0.7},
               {b: 0.4},
               {g: 0.4} ];


// TODO: RubikCell


function getCellIdFromParts(parts) {
	var id = 0;
	var p = parts.slice(0);	// returns a copy
	p.sort();
	p = p.filter( function(it){return it > 0;} );
    for (var i = 0; i < p.length; ++i) {
        id += p[i] * Math.pow(6, i);
    }
    return id;
}


function RubikCell(v) {
    this.pos = v;
    this.parts = new Array(6);
    
    // fill default parts according to cell position
    for (var i = 0; i < 6; ++i) {
        if (sideSelectLookup[i](v)) {
            this.parts[i] = i;
        }
    }
    
    this.id = getCellIdFromParts(this.parts);
    
    this.rotate = function(direction) {
        var sideI = directions.indexOf(direction);
        this.parts = dirRotate3[sideI](this.parts);
        this.pos = dirPosShift[sideI](this.pos);
    };
    
    this.toString = function() {
        return 'id: ' + this.id + ', pos: [' + this.pos + '], parts: [' + this.parts + ']';
    };
}


// TODO: RubikCube


function RubikCube() {
    this.cells = new Array(3);
    
    for (var x = 0; x < 3; ++x) {
        var ys = new Array(3);
        for (var y = 0; y < 3; ++y) {
            var zs = new Array(3);
            for (var z = 0; z < 3; ++z) {
                zs[z] = new RubikCell([x, y, z]);
            }
            ys[y] = zs;
        }
        this.cells[x] = ys;
    }
}

RubikCube.prototype.get = function(x, y, z) {
    return this.cells[x][y][z];
};

RubikCube.prototype.rotate = function(direction) {
    var sideI = directions.indexOf(direction);
    var cells2 = new Array(3);
    for (var x = 0; x < 3; ++x) {
        var ys = new Array(3);
        for (var y = 0; y < 3; ++y) {
            var zs = new Array(3);
            for (var z = 0; z < 3; ++z) {
                var v = [x, y, z];
                var cell = this.get(v);
                if (sideSelectLookup[sideI](v)) {
                    cell.rotate(direction);
                    v = cell.pos;
                    cells2[ v[0] ][ v[1] ][ v[2] ] = cell;
                }
                else {
                    cells2[x][y][z] = cell;
                }
                
                cell = new RubikCell([x, y, z]);
                zs[z] = cell;
            }
            ys[y] = zs;
        }
        cells2[x] = ys;
    }
    this.cells = cells2;
};

RubikCube.prototype.toString = function() {
    var s = '';
    for (var y = 2; y >= 0; --y) {
        for (var x = 0; x < 3; ++x) {
            var c = this.get(x, y, 0);
            var val = c.parts[5];
            s += colors[val];
        }
        s += '\n';
    }
    return s;
};


// TODO: picking
function eventHolder(dataToHold) {
	return function(event) {
		var s = '';
		s += 'dataToHold: ' + dataToHold + '\n';
		s += 'event: ' + listProperties(event.params, false, true);
		alert(s);
	};
}


// TODO: remaining

var yaw   = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;
var rubikCanvas = null;
var rc = null;



// TODO: mouse callbacks

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}



function mouseUp() {
    dragging = false;
}



function mouseMove(event) {
    if (dragging) {
        yaw   += (event.clientX - lastX) *  0.5;
        pitch += (event.clientY - lastY) * -0.5;

        SceneJS.withNode('yaw'  ).set('angle', yaw);
        SceneJS.withNode('pitch').set('angle', pitch);

        SceneJS.withNode('mainScene').render();

        lastX = event.clientX;
        lastY = event.clientY;
    }
}



function traverseInstances(nodeId, res) {
    if (!res) res = '';
    SceneJS.withNode(nodeId).eachNode(
            function() {
                var type = this.get('type');
                var id   = this.get('id');
                
                res += '\n [type: ' + type + ', id: ' + id + ']';
 
                if (type == "instance") {
                    var target = this.get('target');
                    if (SceneJS.nodeExists(target)) {
                        //traverseInstances(target);
                    }
                }
            },
    {
        andSelf: true,    // Visit root as well
        depthFirst: true
    });
}






$(document).ready(function() {
    var rubikCanvas = document.getElementById('rubikCanvas');
    
    rubikCanvas.addEventListener('mousedown', mouseDown, true);
    rubikCanvas.addEventListener('mousemove', mouseMove, true);
    rubikCanvas.addEventListener('mouseup',   mouseUp,   true);
    
    rubikCanvas.addEventListener('mousedown',
                                 function (event) {
                                     SceneJS.withNode('mainScene').pick(event.offsetX, event.offsetY);
                                 }, true);
    
    SceneJS.createNode(
        {type:             'scene',
         id:               'mainScene',
         canvasId:         'rubikCanvas',
         loggingElementId: 'logDiv',
         nodes: [
             {type: 'lookAt',
              eye:  {x: 0, y: 0, z: -200},
              look: {x: 0},
              up:   {y: 1},
              nodes: [
                  {type: 'camera',
                   optics: {type:   'perspective',
                	   		fovy:   25.0,
                	   		aspect: 1.33,
                	   		near:   0.10,
                	   		far:    600},
                   nodes: [
                       {type:     'light',
                    	mode:     'dir',
                    	color:    {r: 1, g: 1, b: 1},
                    	diffuse:  true,
                    	specular: true,
                    	dir:      {x: 1, y: 1, z: -1} },
                       {type:  'rotate',
                    	id:    'pitch',
                    	angle: 0,
                    	x:     1,
                    	nodes: [
                            {type:  'rotate',
                             id:    'yaw',
                             angle: 0,
                             y:     1,
                             nodes: [
                                 {type: 'library',
                                  id:   'lib',
                                  nodes: [
                                      {type:      'geometry',
                                       id:        'face',
                                       primitive: 'triangles',
                                       positions: [-4.5, -4.5, 5,
                                                    4.5, -4.5, 5,
                                                    4.5,  4.5, 5,
                                                   -4.5,  4.5, 5],
                                       indices: [0, 1, 2,
                                                 0, 2, 3],
                                       normals: [0, 0, 1,
                                                 0, 0, 1,
                                                 0, 0, 1,
                                                 0, 0, 1] } ] } ] } ] } ] } ] } ] } );
    
    
    // create materials
    var lib = SceneJS.withNode('lib');
    for (var colorI in colors) {
    	var colorLetter = colors[colorI];
	    var colorRGB = clrRGB[ colorI ];
	    var mat = new SceneJS.Material( {id:        'mat' + colorLetter,
	            						 baseColor: colorRGB,
	            						 specular:  0.9,
	            						 emit:      0.1,
	            						 shine:     100} );
	    lib.add('nodes', mat);
    }
    
    // create rubik cube
    rc = new RubikCube();
    
    
    // populate facelets
    var yawN = SceneJS.withNode('yaw');
    
    for (var x = 0; x < 3; ++x) {
    	for (var y = 0; y < 3; ++y) {
    		for (var z = 0; z < 3; ++z) {
    	    	var cell = rc.get(x, y, z);
    	    	var rot1   = new SceneJS.Rotate( {id: 'r' + cell.id, angle: 0} );
    	    	var trans = new SceneJS.Translate( {x: (x-1)*10, y: (y-1)*10, z: (z-1)*10} );
    	    	
    	    	yawN.add('node', rot1);
    	    	rot1.addNode(trans);
    	    	
    	    	for (var i = 0; i < 6; ++i) {
    	    		var clrIndex = cell.parts[i];
    	    		if (!clrIndex) continue;
    	    		var clr = colors[clrIndex];
    	    		var mat = new SceneJS.Instance( {target: 'mat' + clr} );
    	    		var rot2 = new SceneJS.Rotate( faceRot[i] );
    	    		//rot2.set('id', 'r' + cell.id);
    	    		var gid = 'g' + cell.id;
    	    		var geo = new SceneJS.Instance( {id: gid, target: 'face'} );
    	    		//var info = listProperties(cell, false, true);
    	    		var info = 'pos: ' + cell.pos.toString() + '  parts: ' + cell.parts.toString();
    	    		SceneJS.withNode(gid).bind('picked', eventHolder( info ) );
    	    		trans.addNode(rot2);
    	    		rot2.addNode(mat);
    	    		mat.addNode(geo);
    	    	}
    	    }
        }
    }
    
    
    
    
    // geo
    /*SceneJS.withNode('xxx').bind('picked',
        function(event) {
            SceneJS.withNode('matR').set('emit', 0);
            SceneJS.withNode('mainScene').render();
            alert( listProperties(event, false, true) );
        });*/

    
    //var yawNode = SceneJS.withNode('yaw');
    
    
    //alert( traverseInstances('yaw', '') );
    //SceneJS.setDebugConfigs( {shading: {whitewash: true}} );
    SceneJS.withNode('mainScene').render();
});