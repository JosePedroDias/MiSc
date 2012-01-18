/*jshint browser:true, undef:true, eqeqeq:true */
/*globals JSON:true, alert:true, prompt:true */

//(function() {


var cvsEl;
var svgNS		= 'http://www.w3.org/2000/svg';
var shapePrefix	= 'shp_';
var idNum		= 0;
var shapes		= {};
var style		= {
	fill:			'#AA7',
	stroke:			'#000',
	'stroke-width':	2
};
var current		= {
	op:		'select',
	sel:	undefined,
	shape:	undefined,
	pos:	[0, 0]
};


function s$(a) {
	return document.getElementById(a);
}


function S$(a) {
	return shapes[a];
}

cvsEl = s$('canvas');


function createShape(sType, o) {
	var id = o.id ? o.id : shapePrefix + idNum++;
	var el;
	
	switch(sType) {
		case 'circle':
			el = document.createElementNS(svgNS, 'circle');
			el.setAttribute('r',		o.r			|| 10);
			el.setAttribute('cx',		o.cx ? o.cx : o.pos[0]);
			el.setAttribute('cy',		o.cy ? o.cy : o.pos[1]);
			break;
		
		case 'rect':
			el = document.createElementNS(svgNS, 'rect');
			el.setAttribute('width',	o.width		|| 10);
			el.setAttribute('height',	o.height	|| 10);
			el.setAttribute('x',		o.x ? o.x : o.pos[0]);
			el.setAttribute('y',		o.y ? o.y : o.pos[1]);
			if (o.rx) {	el.setAttribute('rx',	o.rx);	}
			if (o.ry) {	el.setAttribute('ry',	o.ry);	}
			break;
	}

	el.setAttribute('fill',			o.fill				? o.fill			: style.fill);
	el.setAttribute('stroke',		o.stroke			? o.stroke			: style.stroke);
	el.setAttribute('stroke-width',	o['stroke-width']	? o['stroke-width']	: style['stroke-width']);
	el.setAttribute('id',			id);
	
	cvsEl.appendChild(el);
	shapes[id] = el;
	
	return el;
}


function refreshStyleUI() {
	s$('fillBtn'			).style.backgroundColor	= style.fill;
	s$('strokeBtn'			).style.backgroundColor	= style.stroke;
	s$('stroke-widthBtn'	).innerHTML				= style['stroke-width'];
}


function load() {
	var st = localStorage.getItem('gfxeditr_state');
	if (!st) {return;}
	st = JSON.parse(st);
	
	style = st.style;
	refreshStyleUI();
	
	shapes = {};
	var sh, s, id, idN, biggestIdN = 0;
	for (var i = 0, f = st.shapes.length; i < f; ++i) {
		sh = st.shapes[i];
		s = createShape(sh[0], sh[1]);
		id = sh[1].id;
		idN = parseInt(	id.split('_')[1], 10);		
		if (id > biggestIdN) {biggestIdN = idN;}
	}
	
	idNum = idN + 1;
}


function save() {
	var st = {
		style:	style,
		shapes:	[]
	};
	
	var rgx = /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/;
	var shapes = cvsEl.getElementsByTagName('*');
	shapes = Array.prototype.slice.call(shapes);
	shapes.shift();
	var sh, o, I, F, att, val;
	for (var i = 0, f = shapes.length; i < f; ++i) {
		sh = shapes[i];
		o = {};
		for (I = 0, F = sh.attributes.length; I < F; ++I) {
			att = sh.attributes[I];
			val = att.value;
			if (rgx.test(val)) {val = parseFloat(val);}
			o[att.name] = val;
		}
		shapes[i] = [sh.tagName, o];
	}
	st.shapes = shapes;
	
	st = JSON.stringify(st);
	localStorage.setItem('gfxeditr_state', st);
}


function updateSelection(pos) {
	if (!pos) {
		s$('sel').setAttribute('d', 'M 0 0');
		return;
	}
	var x = [0, pos[0], parseInt(	cvsEl.getAttribute('width'), 10)];
	var y = [0, pos[1], parseInt(	cvsEl.getAttribute('height'), 10)];
	var d = '';
	d  = 'M ' + x[0] + ' ' + y[1] + ' ';
	d += 'L ' + x[2] + ' ' + y[1] + ' ';
	d += 'M ' + x[1] + ' ' + y[0] + ' ';
	d += 'L ' + x[1] + ' ' + y[2] + ' ';
	s$('sel').setAttribute('d', d);
}


function getShapeCenter(s) {
	if (!s) {	return undefined;	}
	switch (s.tagName) {
		case 'rect':
			return [
				parseFloat(	s.getAttribute('x')	) + parseFloat(	s.getAttribute('width')		) / 2,
				parseFloat(	s.getAttribute('y')	) + parseFloat(	s.getAttribute('height')	) / 2
			];

		case 'circle':
			return [
				parseFloat(	s.getAttribute('cx')	),
				parseFloat(	s.getAttribute('cy')	)
			];
		
		default:
			throw 'unsupported tagName: "' + s.tagName + '"';
	}
}


function setOp(op) {
	var ops = ['createSel', 'selectBtn', 'moveBtn', 'deleteBtn'];
	for (var i = 0, f = ops.length; i < f; ++i) {
		s$(ops[i]).className = '';
	}
	current.op = op;
	if (op === 'create') {
		s$('createSel').className = 'selected';
		current.shape = s$('createSel').value;
	}
	else {
		s$(op + 'Btn').className = 'selected';
	}

	updateSelection();
}


function init() {
	// UI
	s$('createSel').addEventListener('change', function(event) {
		setOp('create');
	});
	
	s$('loadBtn').addEventListener('click', function(event) {	load();	});
	s$('saveBtn').addEventListener('click', function(event) {	save();	});

	refreshStyleUI();
	
	s$('styles').addEventListener('click', function(event) {
		var tgtEl = event.target;
		var prop = tgtEl.id;
		prop = prop.substring(0, prop.length - 3);
		
		var val = prompt(prop, style[prop]);
		if (prop === 'stroke-width') {
			val = parseFloat(val);
			tgtEl.innerHTML = val;
		}
		else {
			tgtEl.style.backgroundColor	= val;
		}
		style[prop] = val;

		if (current.sel) {
			current.sel.setAttribute(prop, val);
		}
	});

	s$('toggleOps').addEventListener('click', function(event) {
		var op = event.target.id;
		op = op.substring(0, op.length - 3);
		setOp(op);
	});
	
	// 
	cvsEl.addEventListener('mousedown', function(event) {
		var mPos = [event.clientX, event.clientY];
		var onMoveFn, onUpFn;
		current.pos = mPos;
		
		switch (current.op) {
			case 'create':
				switch(current.shape) {
					case 'circle':
						current.sel = createShape('circle', {pos:mPos, r:1});
						onMoveFn = function(event) {
							var mPos = [event.clientX, event.clientY];
							var dlt = [
								mPos[0] - current.pos[0],
								mPos[1] - current.pos[1]
							];
							var dist = Math.sqrt(dlt[0]*dlt[0] + dlt[1]*dlt[1]);
							current.sel.setAttribute('r', dist);
						};
						break;
					
					case 'rect':
						current.sel = createShape('rect', {pos:mPos});
						onMoveFn = function(event) {
							var mPos = [event.clientX, event.clientY];
							var dlt = [
								mPos[0] - current.pos[0],
								mPos[1] - current.pos[1]
							];
							if (dlt[0] < 0) {
								current.sel.setAttribute('x', current.pos[0] + dlt[0]);
								current.sel.setAttribute('width', -dlt[0]);
							}
							else {
								current.sel.setAttribute('width', dlt[0]);
							}
							if (dlt[1] < 0) {
								current.sel.setAttribute('y', current.pos[1] + dlt[1]);
								current.sel.setAttribute('height', -dlt[1]);
							}
							else {
								current.sel.setAttribute('height', dlt[1]);
							}
						};
						break;
				}
				cvsEl.addEventListener('mousemove', onMoveFn);
				onUpFn = function(event) {
					cvsEl.removeEventListener('mousemove', onMoveFn);
					document.removeEventListener('mouseup', onUpFn);
					s$('createSel').value = '';
					setOp('select');
					updateSelection(	getShapeCenter(current.sel)	);
				};
				document.addEventListener('mouseup', onUpFn);
				break;
			
			case 'select':
				if (event.target !== cvsEl && event.target !== document.body) {
					current.sel = event.target;
					updateSelection(	getShapeCenter(current.sel)	);
				}
				break;

			case 'move':
				if (event.target !== cvsEl && event.target !== document.body) {
					current.sel = event.target;
					if (current.sel.tagName === 'rect') {
						current.props = ['x', 'y'];
					}
					else if (current.sel.tagName === 'circle') {
						current.props = ['cx', 'cy'];
					}
					current.init = [
						parseFloat(	current.sel.getAttribute(current.props[0])	),
						parseFloat(	current.sel.getAttribute(current.props[1])	)
					];
					
					onMoveFn = function(event) {
						var mPos = [event.clientX, event.clientY];
						var dlt = [
							mPos[0] - current.pos[0],
							mPos[1] - current.pos[1]
						];
						current.sel.setAttribute(current.props[0], current.init[0] + dlt[0]);
						current.sel.setAttribute(current.props[1], current.init[1] + dlt[1]);
					};

					onUpFn = function(event) {
						cvsEl.removeEventListener('mousemove', onMoveFn);
						cvsEl.removeEventListener('mouseup', onUpFn);
						updateSelection(	getShapeCenter(current.sel)	);
					};
					
					cvsEl.addEventListener('mousemove', onMoveFn);
					document.addEventListener('mouseup', onUpFn);
				}
				break;
			
			case 'delete':
				if (event.target !== cvsEl && event.target !== document.body) {
					delete shapes[event.target.id];
					event.target.parentNode.removeChild(event.target);
					current.sel = undefined;
				}
				break;
		}
		return false;
	});
}

setTimeout(
	function() {
		var dims = [
			window.innerWidth	|| document.documentElement.clientWidth		|| document.body.clientWidth,
			window.innerHeight	|| document.documentElement.clientHeight	|| document.body.clientHeight
		];
		cvsEl.setAttribute('width',		dims[0]);
		cvsEl.setAttribute('height',	dims[1]);
		init();
	},
	1000
);


//})();