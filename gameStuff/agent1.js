var Agent = function() {
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



Agent.prototype = {
	
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
		//console.log(	JSON.stringify(msg)		);
		switch (msg.kind) {
			case 'key':
				if (msg.isDown) {
					switch (msg.code) {
						case this.keys.fw:
							this.speed += 0.4;	// increase speed
							break;
						
						case this.keys.bw:
							this.speed -= 0.4;	// decrease speed
							if (this.speed < 0) {	this.speed = 0;	}
							break;
							
						case this.keys.lf:
							this.angle -= 0.15;	// turn left
							break;
						
						case this.keys.rt:
							this.angle += 0.15;	// turn right
							break;
	
					}
				}
				break;
		}
	},
	
	/**
	 * 
	 */
	act: function(frameNum, t) {
		//console.log([frameNum, t]);
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
	},
	
	/**
	 * 
	 */
	info: function() {
		var s = ''
		+ this.name + ' > '
		+ 'pos: ' + this.pos[0].toFixed(0) + ',' + this.pos[1].toFixed(0) + ', '
		+ 'angle: ' + (this.angle * this.r2d).toFixed(0) + ' deg';
		return s;
	},
	
};

