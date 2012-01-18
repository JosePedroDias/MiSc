var WORLD = function(canvasId, agents) {
	
	var r2d = 180 / Math.PI;
	var pi2 = Math.PI * 2;
	
	var timer;
	var kbReads = [];
	var msReads = [false, false, false, false, false];
	var lastMPos = [0, 0];
	var lastKey = 0;
	
	var cvs = document.getElementById(canvasId);
	var c = cvs.getContext('2d');
	
	var state = {
		canvas:		c,
		fps:		30,
		frameNum:	0,
		background:	'#FFF',	// 'rgba(255, 255, 255, 0.25)'
		agents:		agents,
		startTime:	undefined,
		dims:		[
						parseInt(cvs.getAttribute('width'),  10),
						parseInt(cvs.getAttribute('height'), 10)
					],
		pos:		[0, 0],
		isComplete:	function() {	return false;	}
	};
	
	window.isMouseButtonDown = function(bNum) {
		return msReads[bNum];
	};
	
	window.isKeyDown = function(keyCode) {
		return kbReads[keyCode];
	};
	
	function informAll(msg) {
		for (var i = 0, f = state.agents.length; i < f; ++i) {
			state.agents[i].inform(msg);
		}
	}
	
	function msHandler(e) {
		var e = e || event;
		var pos = [e.x - state.pos[0], e.y - state.pos[1]];
		lastMPos = pos;
		var inside = pos[0] >= 0 && pos[0] < state.dims[0] && pos[1] >= 0 && pos[1] < state.dims[1];
		if (e.type === 'mousemove') {
			informAll({
				kind:	'mousemove',
				pos:	pos,
				inside:	inside
			});
		}
		else {
			var isDown = e.type === 'mousedown';
			msReads[e.button] = isDown;
			//console.log(	msReads.join(',')	);
			informAll({
				kind:	'mouse',
				isDown:	isDown,
				button:	e.button,
				pos:	pos,
				inside:	inside
			});
		}
	}
	
	function kbHandler(e) {
		var e = e || event;
		var code = e.keyCode;
		var isDown = e.type === 'keydown';
		kbReads[code] = isDown;
		lastKey = code;	// for debugging
		
		informAll({
			kind:	'key',
			isDown:	isDown,
			code:	code
		});
		
		return false;
	}
	
	function updateLayout() {
		var bodyDims = [
			window.innerWidth	|| document.documentElement.clientWidth	|| document.body.clientWidth,
			window.innerHeight	|| document.documentElement.clientHeight|| document.body.clientHeight
		];
		
		var cvsDims = [cvs.offsetWidth, cvs.offsetHeight];
		
		//console.log(cvsDims, bodyDims);
		state.pos = [
			parseInt((bodyDims[0]-cvsDims[0]) / 2, 10),
			parseInt((bodyDims[1]-cvsDims[1]) / 2, 10)
		];
		
		cvs.style.left	= state.pos[0] + 'px';
		cvs.style.top	= state.pos[1] + 'px';
	}
	
	function loop() {
		if (state.frameNum === 0) {
			// config world
			
			// init all
			for (var i = 0, f = state.agents.length; i < f; ++i) {
				state.agents[i].init();
				state.startTime = new Date().getTime();
			}
		}
		
		// all:
		var ag, i, f, t, w, h;
		w = state.dims[0];
		h = state.dims[1];
		
		//c.clearRect(0, 0, w, h);
		c.fillStyle = state.background;
		c.fillRect(0, 0, w, h);
		
		// act and check
		for (i = 0, f = state.agents.length; i < f; ++i) {
			ag = state.agents[i];
			
			t = (	new Date().getTime() - state.startTime	) * 0.001;
			
			ag.act(state.frameNum, t);
			
			if		(ag.pos[0] < 0) {	ag.pos[0] += w;	}
			else if	(ag.pos[1] < 0) {	ag.pos[1] += h;	}
			if		(ag.pos[0] >= w) {	ag.pos[0] -= w;	}
			else if	(ag.pos[1] >= h) {	ag.pos[1] -= h;	}
			if		(ag.angle < 0) {	ag.angle += pi2;	}
			else if	(ag.angle > pi2) {	ag.angle -= pi2;	}
		}
		
		// draw
		for (i = 0, f = state.agents.length; i < f; ++i) {
			ag = state.agents[i];
			
			c.save();
				c.translate(	parseInt(ag.pos[0], 10), parseInt(ag.pos[1], 10));
				c.rotate(ag.angle);
				ag.draw( c );
			c.restore();
		}
		
		// debug overlay
		c.textAlign = 'left';
		c.textBaseline = 'top';
		c.font = '12px Helvetica';
		c.fillStyle = '#000';
		c.globalAlpha = 0.5;
		for (i = 0, f = state.agents.length; i < f; ++i) {
			ag = state.agents[i];
			c.fillText(ag.info(), 0, 14*i);
		}
		c.globalAlpha = 1;

		
		// isComplete?
		if (state.isComplete()) {
			clearInterval(timer);
		}
		
		state.frameNum++;
	}
	
	timer = setInterval(loop, 1000/state.fps);
	
	document.body.onresize	= updateLayout;	updateLayout();
	
	document.onkeyup	= kbHandler;
	document.onkeydown	= kbHandler;
	
	document.onmousedown	= msHandler;
	document.onmouseup		= msHandler;
	document.onmousemove	= msHandler;
};



function pathCross(c, sz) {
	c.beginPath();
	c.moveTo(-sz,   0);
	c.lineTo( sz,   0);
	c.moveTo(  0, -sz);
	c.lineTo(  0,  sz);
}

function pathTriangle(c, sx, sy) {
	c.beginPath();
	c.moveTo( sx,   0);
	c.lineTo(-sx, -sy);
	c.lineTo(-sx,  sy);
	c.lineTo( sx,   0);
}
