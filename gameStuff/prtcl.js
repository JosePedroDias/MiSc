PRTCL = {};

PRTCL.System = function() {
	this.particles = [];
	this.forces = [];
	this.pos = [0, 0];
	this.createFn = undefined;
	this.destroyFn = undefined;
	this.modifyFn = undefined;
	
};

PRTCL.System.prototype = {
	init:	function() {
	},
	
	inform:	function() {
	},
	
	act:	function(frameNr, t) {
		if (!this.prevT) {	this.prevT = t;	return;	}
		var dt = t - this.prevT;
		
		this.createFn(frameNr, t, dt);
		this.destroyFn(frameNr, t, t);
		
		/*var p;
		for (var i = 0, f = this.particles.length; i < f; ++i) {
			p = this.particles[i];
			this.updateFn.call( p, t, dt, this);
		}*/
		//this.updateFn.call( p, t, dt, this);
		this.updateFn(t, dt, this);
		
		this.prevT = t;
	},
	
	draw:	function( c ) {
		var p;
		for (var i = 0, f = this.particles.length; i < f; ++i) {
			p = this.particles[i];
			c.beginPath();
			c.arc(Math.round(p.pos[0]), Math.round(p.pos[1]), p.radius, 0, 2*Math.PI);
			c.fillStyle = p.color;
			c.fill();
		}
	},
	
	info:	function() {
		if (this.particles.length < 1) return '';
		//return this.particles.length;
		return this.particles[0].acc.toString();
		//return [this.particles[0].acc[0], this.particles[0].acc[1]].join('   ');
	}
};

PRTCL.Particle = function() {
	this.mass		= 1;
	this.radius		= 1;
	this.color		= '#000';
	this.pos		= $V(2);
	this.prevPos	= $V(2);
	//this.vel		= $V(2);
	this.acc		= $V(2);
};

/*
PRTCL.GForce = function(g) {
	if (!g) {	g = [0, -1];	}
	return function( p, t) {
		var t2 = t * t;
		p.acc = [];
		p.vel = [];
		p.pos = [
			p.pos[0] * t,
			p.pos[1] * t
		];
	};
};
*/

PRTCL.EForce = function(pos, mass) {
	if (!pos) {		pos = $V(2);	}
	if (!mass) {	mass = 1;		}
	return function( p, dt ) {
		var dr = pos.sub(p.pos);
		var d = dr.len();
		var n = dr.normal();
		var f = n.mus(mass * p.mass / d);
		p.acc.add(f, true);
	}
};

/*
PRTCL.MForce = function(pos) {
};
*/