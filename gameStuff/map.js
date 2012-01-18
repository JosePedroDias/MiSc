Map = function(dimx, dimy) {
	this.dims = [dimx, dimy];	// map
	this.tDims = [16, 16];
	this.offs = [0, 0];
	this.cells = new Array(dimx * dimy);
	this.pos = [0, 0];
};


Map.prototype = {
	
	cursorPos: [0, 0],
	
	setCell: function(mapPos, tri) {
		this.cells[mapPos[0] + mapPos[1]*this.dims[0]] = tri;
	},
	
	draw:	function( ct ) {
		//ct.scale(2, 2);
		var x, y, a, b, c, i = 0;
		for (y = 0; y < this.dims[1]; ++y) {
			for (x = 0; x < this.dims[0]; ++x) {
				c = this.cells[i];
				if ( c ) {
					IMG.drawTile(c[0], [c[1], c[2]], [x, y], 16);
				}
				++i;
			}
		}
		
		// grid
		ct.beginPath();
		for (y = 0; y <= this.dims[1]; ++y) {
			ct.moveTo(0, y*this.tDims[1]-0.5);
			ct.lineTo(this.dims[0]*this.tDims[0], y*this.tDims[1]-0.5);
		}
		for (x = 0; x <= this.dims[0]; ++x) {
			ct.moveTo(x*this.tDims[0]-0.5, 0);
			ct.lineTo(x*this.tDims[0]-0.5, this.dims[1]*this.tDims[1]);
		}
		ct.strokeStyle = 'rgba(0, 0, 0, 0.1)';
		ct.strokeWidth = 1;
		ct.stroke();
		
		// current tile
		IMG.drawTile('a', this.cursorPos, this.dims, 16);
	},
	
	init: function() {},
	inform: function(o) {
		//console.log(	JSON.stringify(o)	);
		if ((o.kind === 'mouse' || o.kind === 'mousemove') && o.inside && isMouseButtonDown(0)) {
			var coords = [	parseInt(o.pos[0] / 16, 10), parseInt(o.pos[1] / 16, 10)	];
			if (coords[0] >= this.dims[0] || coords[1] >= this.dims[1]) {
				return;
			}
			
			this.setCell(coords, !isKeyDown(16) ? ['a', this.cursorPos[0], this.cursorPos[1]] : undefined);
			//console.log(coords);
		}
		else if (o.kind === 'key' && o.isDown) {
			switch (o.code) {
				case 38:	--this.cursorPos[1];	break;
				case 40:	++this.cursorPos[1];	break;
				case 37:	--this.cursorPos[0];	break;
				case 39:	++this.cursorPos[0];	break;
				case 83:	console.log(	JSON.stringify(this.cells)	);	break;
				default:
					//var dt = IMG.c.getImageData(0, 0, 640, 480);
					//console.log(	getPixel(dt, 640, 480, 0, 0)	);
			}
		}
	},
	act: function() {},
	info: function() {return this.cursorPos;},
	
};


