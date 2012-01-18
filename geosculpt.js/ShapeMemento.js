
GS.ShapeMemento = function(shape) {
	this.shape = shape;
	
	// make a copy of shape's internal state (deep copy!)
	var i, iLen, it;
	
	this.vertices = new Array(shape.vertices.length);
	for (i = 0, iLen = shape.vertices.length; i < iLen; ++i) {
		it = shape.vertices[i];
		this.vertices[i] = it.slice();
	}
	
	this.faces = new Array(shape.faces.length);
	for (i = 0, iLen = shape.faces.length; i < iLen; ++i) {
		it = shape.faces[i];
		this.faces[i] = it.slice();
	}
	
	this.colors = shape.colors.slice();
};



GS.ShapeMemento.prototype = {
	
	restore: function() {
		this.shape.vertices	= this.vertices;
		this.shape.faces	= this.faces;
		this.shape.colors	= this.colors;
		this.shape._updateStructure();
	},
	
	destroy: function() {
		delete this.vertices;
		this.vertices = undefined;
		
		delete this.faces;
		this.faces = undefined;
		
		delete this.colors;
		this.colors = undefined;
	}
	
};
