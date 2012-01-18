/**
 * Bejeweled game implemented in JavaScript with Raphael.
 * 
 * @author jose.pedro.dias AT gmail.com
 * 
 * TODO: onmouseover/out muda cor
 * TODO: calcula pontuação
 * TODO: repreenche tabuleiro que tenha undefineds...
 * TODO: usa tipo de letra para score, jogar outra vez
 * TODO: som
 * TODO: animações: drag, gravidade
 */
var BJWLD = function(rootElId){
	this.rootElId	= rootElId;
	this.dbgEl		= document.getElementById('dbg');
	
	this.cellsPerSide = 8;
	this.cellSide = 48;
	this.score = 0;
	
	var w = this.cellSide * this.cellsPerSide;
	this.R = Raphael(rootElId, w, w);
	
	this.boardSet = null;
	this.gemStrokeWidth = 2;
	this.gemRadius = Math.round(this.cellSide * 0.35);
	
	this.cellColors			= ['#222', '#333'];
	this.cellColorsChosen	= ['#882', '#993'];
	
	this.gemAvailableTypes = [0, 2, 3, 4, 5, 6, 8];
	
	this.gemColors = {
		0: '#FFF',	// white		ball
		2: '#F00',	// red rounded	square
		3: '#F0F',	// magenta		triangle
		4: '#FF0',	// yellow		diamond
		5: '#0FF',	// cyan			pentagon
		6: '#F70',	// orange		hexagon
		8: '#0F0'	// green		octogon
	};
	
	// 8 x 8 arrays for:
	//	positions	[x,y],
	//	gemTypes 	(integer nr <=> nr of sides),
	//	cells		(rects),
	//	gems		(path | circle | rect)
	this.positions	= new Array(this.cellsPerSide);
	this.gemTypes	= new Array(this.cellsPerSide);
	this.cells		= new Array(this.cellsPerSide);
	this.gems		= new Array(this.cellsPerSide);
	var i;
	for (i = 0; i < this.cellsPerSide; ++i) {
		this.positions[i]	= new Array(this.cellsPerSide);
		this.gemTypes[i]	= new Array(this.cellsPerSide);
		this.cells[i]		= new Array(this.cellsPerSide);
		this.gems[i]		= new Array(this.cellsPerSide);
	}
	
	// for mouse events
	this.startPos = undefined;
	this.endPos = undefined;
};

// TODO: temp
var t_ = undefined;

BJWLD.prototype = {
	create: function() {
		var ix, iy;
		
		// create cells into boardSet
		var styles = [
			{'stroke-width':0, fill: this.cellColors[0]},
			{'stroke-width':0, fill: this.cellColors[1]}
		];
		this.boardSet = this.R.set();
		var st, cell;
		for (iy = 0; iy < this.cellsPerSide; ++iy) {
			for (ix = 0; ix < this.cellsPerSide; ++ix) {
				st = styles[ (ix+iy) % 2 ];
				cell = this.R.rect(ix*this.cellSide, iy*this.cellSide, this.cellSide, this.cellSide).attr(st);
				cell.attr({target: ix + ' ' + iy});
				this.boardSet.push(cell);
				this.positions[ix][iy] = [(ix+0.5)*this.cellSide, (iy+0.5)*this.cellSide];
				this.cells[ix][iy] = cell;
			}
		}
		
		// create position labels (for debug)
		var	cs = this.cellSide,
			cd = cs * 0.1,
			st = {fill: '#FFF', 'text-anchor': 'start'};
		for (iy = 0; iy < this.cellsPerSide; ++iy) {
			for (ix = 0; ix < this.cellsPerSide; ++ix) {
				//this.R.text(ix * cs + cd, iy * cs + cd, ix + ',' + iy).attr(st);
			}
		}
		
		// create gems
		this.fillGems();
		
		// cell events
	
		var that = this;
		
		function onMouseCell(event) {
			var tgt = event.target.raphael;
			var pos = [tgt.attrs.x / that.cellSide, tgt.attrs.y / that.cellSide];
			var p1, p2;
			//that.debug(pos + ' ');
			
			if (event.type == 'mousedown') {
				that.startPos = pos;
			}
			else if	(event.type == 'mouseup') {
				that.endPos = pos;
				
				p1 = that.startPos;
				p2 = that.endPos;
				
				if ( (	(p1[0] - p2[0]) == 0 		&&
						Math.abs(p1[1] - p2[1]) == 1) ||
					 (  (p1[1] - p2[1]) == 0 		&&
						Math.abs(p1[0] - p2[0]) == 1) ) {
					
					that.debug(p1 + ' -> ' + p2);
					that.debugLine();
				}
			}
			
			//for (var a in event) {	that.debug(a);	that.debugLine();	}
		}
		
		function onClickCell(event) {
			var tgt = event.target.raphael;
			var pos = [tgt.attrs.x / that.cellSide, tgt.attrs.y / that.cellSide];
			tgt.attr({fill: that.cellColorsChosen[ (pos[0]+pos[1])%2  ]});
			
			
		}
		
		
		function onMouseGem(event) {
			var tgt = event;
			var pos = [
				Math.floor(tgt.x / that.cellSide),
				Math.floor(tgt.y / that.cellSide),
			];
			that.debug(pos + ' ');
			//that.debug(that.R.x + ' ');
			//that.debug(tgt.transform + ' ');
			
			// TODO: compute pos from canvas offset on page OR
			// TODO: canvas based picking
			t_ = that.R;
		}
		
		function onClickGem(event) {
			var tgt = event.target.raphael;
			var pos = [tgt.attrs.x / that.cellSide, tgt.attrs.y / that.cellSide];
			//tgt.attr({fill: that.cellColorsChosen[ (pos[0]+pos[1])%2  ]});
		}
		
		var node;
		for (iy = 0; iy < this.cellsPerSide; ++iy) {
			for (ix = 0; ix < this.cellsPerSide; ++ix) {
				node = this.cells[ix][iy].node;
				node.onmousedown	= onMouseCell;
				node.onmouseup		= onMouseCell;
				//node.onclick		= onClickCell;
				
				//node = this.gems[ix][iy].node;
				//node.onmousedown	= onMouseGem;
				//node.onmouseup		= onMouseGem;
				//node.onclick		= onClickGem;
			}
		}
	},
	
	clearGems: function() {
		var ix, iy, gem;
		for (iy = 0; iy < this.cellsPerSide; ++iy) {
			for (ix = 0; ix < this.cellsPerSide; ++ix) {
				this.gemTypes[ix][iy] = undefined;
				
				gem = this.gems[ix][iy];
				if (!gem) continue;
				gem.remove();
				this.gems[ix][iy] = undefined;
			}
		}
	},
	
	randomType: function() {
		return this.gemAvailableTypes[ Math.floor( Math.random() * this.gemAvailableTypes.length ) ];
	},
	
	fillGems: function() {
		var ix, iy, pos, k, gt;
		for (iy = 0; iy < this.cellsPerSide; ++iy) {
			for (ix = 0; ix < this.cellsPerSide; ++ix) {
				gt = this.randomType();
				this.createGem(ix, iy, gt);
			}
		}
	},
	
	createGem: function(ix, iy, gemType) {
		var gem;
		var gt	= gemType,
			pos	= this.positions[ix][iy]; 
		
		var	gr		= this.gemRadius,
			gr2		= this.gemRadius / 2,
			gr80	= this.gemRadius * 0.8;
		
		if (gt == 0) {
			gem = this.R.circle(0, 0, gr80);
		}
		else if (gt == 2) {
			gem = this.R.rect(-gr80, -gr80, gr80*2, gr80*2, gr2);
		}
		else {
			gem = this.R.ngon(0, 0, gr, gt);
		}
		
		if (gt == 3) {
			gem.scale(1.15).translate(0, gr * 0.2);
		}
		else if (gt == 8) {
			gem.rotate(22.5);
		}
		
		gem.translate(pos[0], pos[1]);
		gem.attr( {fill: this.gemColors[gt], 'stroke-width': this.gemStrokeWidth} );
		
		this.gemTypes[ix][iy] = gt;
		this.gems[ix][iy] = gem;
	},
	
	detectSequences: function() {
		var thisType, lastType;
		var found		= [],
			foundCount	= 1;
		
		function checkEnd(idx) {
			var i, pos;
			var	s = '',
				foundTemp = [],
				p = (idx == 1) ? 'COL' : 'ROW';
			
			for (i = 1; i <= foundCount; ++i) {
				pos = (idx == 1) ? [ix, iy+i] : [ix+i, iy];
				s += '(' + pos + '), ';
				foundTemp.push(pos);
			}
			
			if (foundCount > 2) {
				this.debug(foundCount + ' x '+ p + ': ' + s.substring(0, s.length-2));
				this.debugLine();
				for (i = 0; i < foundTemp.length; ++i) {
					// TODO: check repeated items
					found.push(foundTemp[i]);
				}
			}
			foundCount = 1;
		}
		
		// rows
		for (iy = this.cellsPerSide - 1; iy >= 0; --iy) {
			lastType = undefined;
			for (ix = this.cellsPerSide - 1; ix >= 0; --ix) {
				thisType = this.gemTypes[ix][iy];
				
				if (lastType == thisType) {	foundCount += 1;		}
				else {						checkEnd.call(this, 0);	}
				
				lastType = thisType;
			}
			checkEnd.call(this, 0);
		}
		
		// columns
		for (ix = this.cellsPerSide - 1; ix >= 0; --ix) {
			lastType = undefined;
			for (iy = this.cellsPerSide - 1; iy >= 0; --iy) {
				thisType = this.gemTypes[ix][iy];
				
				if (lastType == thisType) {	foundCount += 1;		}
				else {						checkEnd.call(this, 1);	}
				
				lastType = thisType;
			}
			checkEnd.call(this, 1);
		}
		
		var set = undefined;
		var that = this;
		
		function applyGravity(event) {
			// remove gems and gemTypes
			var i, fnd;
			for (i = 0; i < found.length; ++i) {
				fnd = found[i];
				ix = fnd[0];
				iy = fnd[1];
				that.gems[ix][iy] = undefined;
				that.gemTypes[ix][iy] = undefined;
			}
			
			set.remove();
			
			// TODO: 1) calculate new gemTypes (with y translation)
			// TODO: 2) perform animation downwards, on callback switch gemTypes
			// TODO: 3) if empty cells below TOP row, apply gravity again
			// TODO: 4) generate new gems...
		}
		
		// process found...
		if (found.length > 0) {
			set = this.R.set();
			var i, fnd;
			for (i = 0; i < found.length; ++i) {
				fnd = found[i];
				ix = fnd[0];
				iy = fnd[1];
				set.push( this.gems[fnd[0]][fnd[1]] );
			}
			set.animate({opacity: 0, scale: 3}, 500, '>', applyGravity);
		}
	},
	
	restart: function() {
		this.score = 0;
		this.clearGems();
		this.fillGems();
		this.debugClear();
	},
	
	debugClear: function() {
		this.dbgEl.innerHTML = '';
	},
	
	debug: function(txt) {
		this.dbgEl.innerHTML += txt;
	},
	
	debugLine: function(txt) {
		this.dbgEl.appendChild( document.createElement('br') );
	}
};

//(function() {
//})();
