IMG = {};

IMG.init = function( c ) {
	this.c = c;
	this.tileSets = {};
};

IMG.loadTileSet = function(name, img, dims, gaps, offs) {
	this.tileSets[name] = {
		img:	img,
		dims:	dims,
		gaps:	gaps,
		offs:	offs,
		m:		[	dims[0] + gaps[0], dims[1] + gaps[1]	]
	};
};

IMG.drawTile = function(name, tpos, pos, mult) {
	if (!pos) {		pos = [0, 0];	}
	if (!mult) {	mult = 0;		}
	var o = this.tileSets[name];
	
	this.c.drawImage(
		o.img,
		o.offs[0] + o.m[0]*tpos[0], o.offs[1] + o.m[1]*tpos[1],
		o.dims[0], o.dims[1],
		pos[0]*mult, pos[1]*mult,
		o.dims[0], o.dims[1]
	);
};



function setPixel(dt, w, h, x, y, r, g, b, a) {
	var i = (x + y*w) * 4;
	dt.data[i++] = r;
	dt.data[i++] = g;
	dt.data[i++] = b;
	dt.data[i  ] = (typeof a === 'number') ? a : 255;
}

function getPixel(dt, w, h, x, y, getAlpha) {
	var i = (x + y*w) * 4;
	var r = [];
	r.push(	dt.data[i++]	);
	r.push(	dt.data[i++]	);
	r.push(	dt.data[i++]	);
	
	if (getAlpha) {
		r.push(	dt.data[i]	);
	}
	
	return r;
}

// SHIFT HUE

function filterImage(dt, w, h, prefixFn, testFn, transformFn, postfixFn) {
	for (var i = 0, f = w * h; i < f; ++i) {
		var px = getPixel(dt, f, 1, i, 0, true);
		if (prefixFn) {	px = prefixFn(px);	}
		if (testFn(px)) {
			if (transformFn) {	px = transformFn(px);	}
			if (postfixFn) {	px = postfixFn(px);	}
			setPixel(dt, f, 1, i, 0, px[0], px[1], px[2], px[3]);
		}
	}
}

function grayscaleImage(dt, w, h) {
	filterImage(dt, w, h,
		/*prefix*/		undefined,
		/*test*/		function() {	return true;	},
		/*transform*/	function(px) {	var p = parseInt((px[0] + px[1] + px[2]) / 3, 10);	return [p, p, p, px[3]];	},
		/*postfix*/		undefined
	);
}

function clamp(x) {
	if (x < 0) {	return 0;	}
	if (x > 1) {	return 1;	}
	return x;
}

function shiftHue(dt, w, h, sHue) {	//, mSat, mLgh) {
	filterImage(dt, w, h,
		/*prefix*/		function(px) {	return CLR.rgb2hsv(px);		},
		/*test*/		function() {	return true;	},
		/*transform*/	//function(px) {	return [(px[0] + sHue) % 360, clamp(px[1]*mSat), clamp(px[2]*mLgh), px[3]];	},
		/*transform*/	function(px) {	return [(px[0] + sHue) % 360, px[1], px[2], px[3]];	},
		/*postfix*/		function(px) {	return CLR.hsv2rgb(px);		}
	);
}

function entransparent(dt, w, h) {
	filterImage(dt, w, h,
		/*prefix*/		undefined,
		/*test*/		function() {	return true;	},
		/*transform*/	function(px) {	if (px[0]===255 && px[1]===0 && px[2]===255) {	return [0, 0, 0, 0];	}	return [px[0], px[1], px[2], px[3]];	},
		/*postfix*/		undefined
	);
}

function threshold(dt, w, h, thr) {
	filterImage(dt, w, h,
		/*prefix*/		undefined,
		/*test*/		function() {	return true;	},
		/*transform*/	function(px) {	var v = (px[0]>thr) ? 255 : 0; return [v, v, v, 255];	},
		/*postfix*/		undefined
	);
}



function loadImageToCanvas(imgUri, canvasId, cb) {
	var img = new Image();
	img.onload = function() {
		var w = img.width;
		var h = img.height;
		var cvs = document.getElementById(canvasId);
		cvs.setAttribute('width', w);
		cvs.setAttribute('height', h);
		var c = cvs.getContext('2d');
	    c.drawImage(img, 0, 0);
	    cb(c, img, w, h);
	}
	img.src = imgUri;
}



// PERLIN NOISE. based on the brilliant article http://devmag.org.za/2009/04/25/perlin-noise/


function generateWhiteNoise(w, h) {
	var arr = new Float32Array(w*h);
	for (var i = 0, f = w * h; i < f; ++i) {
		arr[i] = Math.random();
	}
	return arr;
}


function generateGradient(w, h) {
	var arr = new Float32Array(w*h);
	var x, y;
	for (y = 0; y < h; ++y) {
		for (x = 0; x < w; ++x) {
			arr[x + y*w] = x/w;
		}
	}
	return arr;
}


function generateSmoothNoise(bNoise, w, h, octave) {
	var sNoise = new Float32Array(w*h);
	
	samplePeriod = 1 << octave;			// calculates 2 ^ octave
	sampleFrequency = 1 / samplePeriod;
	
	var i, j, i0, i1, j0, j1, top, bottom, hBlend, vBlend;
	for (i = 0; i < w; ++i) {
		// calculate the horizontal sampling indices
		i0 = Math.floor(i / samplePeriod) * samplePeriod;
		i1 = Math.floor(i0 + samplePeriod) % w;			// wrap around
		hBlend = (i - i0) * sampleFrequency;
		
		for (j = 0; j < h; ++j) {
			// calculate the vertical sampling indices
			j0 = Math.floor(j / samplePeriod) * samplePeriod;
			j1 = Math.floor(j0 + samplePeriod) % h;		// wrap around
			vBlend = (j - j0) * sampleFrequency;
			
			top		= interpolate(bNoise[i0 + j0*w], bNoise[i1 + j0*w], hBlend);	// blend the top corners
			bottom	= interpolate(bNoise[i0 + j1*w], bNoise[i1 + j1*w], hBlend);	// blend the bottom corners
			
			sNoise[i + j*w] = interpolate(top, bottom, vBlend);						// final blend
		}
	}
	
	return sNoise;
}


function generatePerlinNoise(w, h, octaveCount) {
	var bNoise = generateWhiteNoise(w, h);
	
	var i, j, o;
	var sNoise = new Array(octaveCount);		// an array of 2D arrays
	var persistance = 0.5;
	
	// generate smooth noise
	for (o = 0; o < octaveCount; ++o) {
		sNoise[o] = generateSmoothNoise(bNoise, w, h, o);
	}
	
	var pNoise = new Float32Array(w*h);
	var amplitude = 1;
	var totalAmplitude = 0;
	
	// blend noise together
	for (o = octaveCount - 1; o >= 0; --o) {
		amplitude *= persistance;
		totalAmplitude += amplitude;
		
		for (i = 0; i < w; ++i) {
			for (j = 0; j < h; ++j) {
				pNoise[i + j*w] += sNoise[o][i + j*w] * amplitude;
			}
		}
	}
	
	// normalisation
	for (i = 0; i < w; ++i) {
		for (j = 0; j < h; ++j) {
			pNoise[i + j*w] /= totalAmplitude;
			//if (pNoise[i + j*w] > 1) {	pNoise[i + j*w] = 1;	}
		}
	}
	
	return pNoise;
}


function interpolate(a, b, alpha) {
	return (1 - alpha) * a + alpha * b;
}


function adjustLevels(noise, w, h, min, max) {
	var v;
	for (var i = 0; i < w*h; ++i) {
		v = noise[i];
		if		(v <= min) {	noise[i] = 0;				}
		else if	(v >= max) {	noise[i] = 1;				}
		else {					(v - min) / (max - min);	}
	}
}


function renderNoise(noise, w, h, c, interp) {
	var i, j, n;
	var dt = c.getImageData(0, 0, w, h);
	for (i = 0; i < w; ++i) {
		for (j = 0; j < h; ++j) {
			if (interp) {
				n = interp.getRGB(	noise[i + j*w]	);
				setPixel(dt, w, h, i, j, n[0], n[1], n[2]);
			}
			else {
				n = parseInt(noise[i + j*w] * 255, 10);
				setPixel(dt, w, h, i, j, n, n, n);
			}
		}
	}
	c.putImageData(dt, 0, 0);
}





