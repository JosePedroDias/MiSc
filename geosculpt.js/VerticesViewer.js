


GS.VerticesViewer = function(geo, scene) {
	this.geo = geo;
	this.scene = scene;
	this.particles = [];
	this.mode = 'dots';
	
	this.toggleMode();
	this.render();
}



GS.VerticesViewer.prototype = {
	
	toggleMode: function() {
		if (this.mode === 'dots') {
			this.mode = 'numbers';
			
			this.ptclMtl = new THREE.ParticleCanvasMaterial({
				color: 0x000000,
				program: function(ctx) {
					ctx.scale(0.5, -0.5);
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					if (!window.xx) window.xx = 0;
					//var x = arguments.callee.caller.arguments[0];
					//console.log(x);
					ctx.strokeText('' + window.xx, 0, 0);
					++window.xx;
				}
			});
			this.ptclMtl.depthTest = false;
		}
		else {
			this.mode = 'dots';
			
			this.ptclMtl = new THREE.ParticleCanvasMaterial({
				color: 0x000000,
				program: function(ctx) {
					ctx.beginPath();
					ctx.arc(0, 0, 1, 0, Math.PI*2, true);
					ctx.closePath();
					ctx.fill();
				}
			});
		}
	},
	
	render: function() {
		var ptcl, v, i, iLen = this.particles.length;
		
		// delete prior particles
		for (i = 0; i < iLen; ++i) {
			ptcl = this.particles[i];
			this.scene.deleteChild(ptcl);		// ? removeObject?
		}
		
		// novos
		iLen = this.geo.vertices.length;
		for (i = 0; i < iLen; ++i) {
			v = this.geo.vertices[i];
			//console.log(v);
			ptcl = new THREE.Particle(this.ptclMtl);
			ptcl.position = v.position;
			ptcl.scale.x = ptcl.scale.y = 6;
			this.scene.addObject(ptcl);
		}
	}
	
};
