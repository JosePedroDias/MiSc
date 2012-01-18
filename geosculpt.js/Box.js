


GS.Box = function(scene, width, height, depth) {
	GS.Shape.call(this, scene);	// parent ctor
	this.width  = width;
	this.height = height;
	this.depth  = depth;
	
	var dx = width  / 2;
	var dy = height / 2;
	var dz = depth  / 2;

	// creating vertices
	this.vertices.push( [-dx,  dy,  dz] );	// 0
	this.vertices.push( [-dx, -dy,  dz] );	// 1
	this.vertices.push( [ dx, -dy,  dz] );	// 2
	this.vertices.push( [ dx,  dy,  dz] );	// 3
	this.vertices.push( [-dx,  dy, -dz] );	// 4
	this.vertices.push( [-dx, -dy, -dz] );	// 5
	this.vertices.push( [ dx, -dy, -dz] );	// 6
	this.vertices.push( [ dx,  dy, -dz] );	// 7
	
	// creating faces
	this.faces.push( [0,1,2,3] );	// front
	this.faces.push( [3,2,6,7] );	// right
	this.faces.push( [7,6,5,4] );	// back
	this.faces.push( [4,5,1,0] );	// left
	this.faces.push( [4,0,3,7] );	// top
	this.faces.push( [1,5,6,2] );	// bottom
	
	this._init();
	this._finishCreation();
};



GS.Box.prototype = new GS.Shape();
GS.Box.prototype.constructor = GS.Box; 
