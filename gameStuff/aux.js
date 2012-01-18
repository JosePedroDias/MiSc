// GOT THESE FROM: vorlon.case.edu/~vxl11/software/gauss.html

/**
 * Generator of pseudo-random number according to a normal distribution with mean=0 and variance=1.
 * Use the Box-Mulder (trigonometric) method and discards one of the two generated random numbers.
 */
function normal() {
	var u1, u2;
	u1 = u2 = 0.;
	while (u1 * u2 == 0.) {
		u1 = Math.random();
		u2 = Math.random();
	}
	return Math.sqrt(-2. * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
 
 
/**
 * Generator of pseudo-random number according to a normal distribution with given mean and variance.
 * Normalizes the outcome of function normal.
 */
function gauss(mean, stdev) {
	return stdev * normal() + 1. * mean;
}



function randomFloat() {
	var res = [];
	var arg;
	for (var i = 0, f = arguments.length; i < f; ++i) {
		arg = arguments[i];
		res.push(arg[0] + (arg[1]-arg[0]) * Math.random());
	}
	return res;
}

function randomInt() {
	var res = randomFloat.apply(this, arguments);
	for (var i = 0, f = res.length; i < f; ++i) {
		res[i] = parseInt(res[i], 10);
	}
	return res;
}

function randomGauss() {
	var res = [];
	var arg;
	for (var i = 0, f = arguments.length; i < f; ++i) {
		arg = arguments[i];
		res.push(	gauss(arg[0], arg[1])	);
	}
	return res;
}

function randomColor() {
	var res = randomFloat.apply(this, arguments);
	return CLR.hsv2rgb.apply(this, res);
}


function interpolator() {
	this.steps = [];
}

interpolator.prototype = {
	add: function(t, v) {
		this.steps.push([t, v]);
	},
	
	get: function(t) {
		if (this.steps.length < 2) {					throw 'please add steps first!';	}
		if (t < this.steps[0][0]) {						throw 't smaller than first step (' + t + ')!';	}
		if (t > this.steps[this.steps.length-1][0]) {	throw 't bigger than last step (' + t + ')!';	}
		var step, ti, vi, tf, vf;
		for (var i = 0, f = this.steps.length; i < f; ++i) {
			step = this.steps[i];
			tf = step[0];
			vf = step[1];
			if (i !== 0 && t >= ti && t <= tf) {
				var frac = (t - ti) / (tf - ti);
				if (vi instanceof Array) {
					var v = new Array(vi.length);
					for (i = 0, f = vi.length; i < f; ++i) {
						v[i] = vi[i] + (vf[i] - vi[i]) * frac;
					}
					return v;
				}
				else {
					return vi + (vf - vi) * frac;
				}
			}
			ti = tf;
			vi = vf;
		}
	},
	
	addRGB: function(t, rgb) {
		//this.add(t, CLR.rgb2hsv(rgb));
		this.add(t, rgb);
	},
	
	getRGB: function(t) {
		//return CLR.hsv2rgb(this.get(t));
		return this.get(t);
	}
	
};



// MILDLY BASE ON https://raw.github.com/mde/fleegix-js-javascript-toolkit/master/plugins/color/convert.js

CLR = {};

CLR.hex2rgb = function(str) {
	if (str.indexOf('#') === 0) {	str = str.substring(1);	}
	var res = [];
	var dlt = 2, c;
	if (str.length === 3) {		dlt = 1;	}
	while (str.length > 0) {
		c = str.substring(0, dlt);
		if (dlt === 1) {	c = c + c;	}
		res.push(	parseInt(c, 16)	);
		str = str.substring(dlt);
	}
	return res;
};

CLR.rgb2hex = function(r, g, b) {
	var conv = function (x) {
		var s = x.toString(16);
		while(s.length < 2) { s = '0' + s; }
		return s;
	};
	var hex = [];
	for (var i = 0; i < arguments.length; i++) {	hex.push(conv(arguments[i]));	}
	hex.unshift("#");
	return hex.join('');
};

// Credits: Based on C Code in "Computer Graphics --
// Principles and Practice," Foley et al, 1996, p. 593.
CLR.hsv2rgb = function (h, s, v, a) {
	if (h instanceof Array) {	a = h[3];	v = h[2];	s = h[1];	h = h[0];	}
	//if (h === 360) { h = 0; }
	h = h % 360;
	var r, g, b;
	
	if (s === 0) {	// Achromatic
		r = v; g = v; b = v;
	}
	else {			// Chromatic color
		var hTemp = h / 60;				// h is now in [0,6]
		var i = Math.floor(hTemp);		// largest integer <= h
		var f = hTemp - i;				// fractional part of h
		var p = v * (1 - s);
		var q = v * (1 - (s * f));
		var t = v * (1 - (s * (1 - f)));
		
		switch (i) {
			case 0: r = v; g = t; b = p; break;
			case 1: r = q; g = v; b = p; break;
			case 2: r = p; g = v; b = t; break;
			case 3: r = p; g = q; b = v; break;
			case 4: r = t; g = p; b = v; break;
			case 5: r = v; g = p; b = q; break;
		}
	}
	
	r = Math.floor(r * 255);	// required?
	g = Math.floor(g * 255);
	b = Math.floor(b * 255);
	
	if (a !== undefined) {	return [r, g, b, a];	}
	return [r, g, b];
};

// Credits: Based on C Code in "Computer Graphics --
// Principles and Practice," Foley et al, 1996, p. 593.
CLR.rgb2hsv = function(r, g, b, a) {
	if (r instanceof Array) {	a = r[3];	b = r[2];	g = r[1];	r = r[0];	}
	var h, s, v;
	var min = Math.min(r, g, b);
	
	v = Math.max(r, g, b);
	var delta = v - min;
	
	// Calculate saturation (0 if r, g and b are all 0)
	s = (v === 0) ? 0 : delta / v;
	
	if (s === 0) {	// Achromatic
		h = 0;
	}
	else {			// Chromatic
		if (r === v) {		// between yellow and magenta
			h = 60 * (g - b) / delta;
		}
		else if (g === v) {	// between cyan and yellow
			h = 120 + 60 * (b - r) / delta;
		}
		else if (b === v) {	// between magenta and cyan
			h = 240 + 60 * (r - g) / delta;
		}
		if (h < 0) { h += 360; }
	}
	v = (v / 255);
	
	//h = Math.floor(h);	// required?
	
	if (a !== undefined) {	return [h, s, v, a];	}
	return [h, s, v];
};
