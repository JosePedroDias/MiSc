var PredatorAgent = function(prey) {
	this.prey	= prey;
	
	this.pos	= [0, 0];
	this.angle	= 0;
	this.speed	= 0;
	this.color	= '#739';
	this.name	= 'ag_' + parseInt(Math.random()*100000, 10);
	
	this.keys = {
		fw:	38,
		bw: 40,
		lf:	37,
		rt:	39
	};
};



PredatorAgent.prototype = {
	
	r2d:	180 / Math.PI,
	
	/**
	 * 
	 */
	init: function() {
	},
	
	/**
	 * 
	 */
	inform: function(msg) {
	},
	
	/**
	 * 
	 */
	act: function(frameNum, t) {
		var prey = this.prey;
		var relPos = [	prey.pos[0] - this.pos[0], prey.pos[1] - this.pos[1] ];
		var a = this.angle + Math.PI/2;
		relPos = [
			 relPos[0] * Math.cos(a) + relPos[1] * Math.sin(a),
			-relPos[0] * Math.sin(a) + relPos[1] * Math.cos(a),
		]; // rotate
		var l = Math.sqrt(relPos[0]*relPos[0] + relPos[1]*relPos[1]);	// normalize
		relPos = [relPos[0]/l, relPos[1]/l];
		this.rp = relPos;
		
		var thr = 0.15/2;
		
		if		(relPos[0] < thr) {	this.angle -= 0.15;	}	// turn left
		else if	(relPos[0] > thr) {	this.angle += 0.15;	}	// turn right
		
		if (this.speed < prey.speed) {	this.speed += 0.4;	}	// increase speed
		if (this.speed > prey.speed) {	this.speed -= 0.4;	}	// decrease speed
		
		// move...
		this.pos[0] += this.speed * Math.cos(this.angle);
		this.pos[1] += this.speed * Math.sin(this.angle);
	},
	
	/**
	 * 
	 */
	draw: function( c ) {
		pathTriangle(c, 16, 12);
		c.fillStyle = this.color;
		c.fill();
		
		/*c.beginPath();
		c.moveTo(0, 0);
		c.lineTo(this.rp[0]*50, this.rp[1]*50);
		c.strokeStyle = '#aaa';
		c.stroke();*/
	},
	
	/**
	 * 
	 */
	info: function() {
		var s = ''
		+ this.name + ' > '
		+ 'pos: ' + this.pos[0].toFixed(0) + ',' + this.pos[1].toFixed(0) + ', '
		+ 'angle: ' + (this.angle * this.r2d).toFixed(0) + ' deg';
		//+ this.rp[0].toFixed(0) + ', ' + this.rp[1].toFixed(0);
		return s;
	},
	
};

