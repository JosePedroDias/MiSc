(function() {
	var _precision = 1e-6;	// used in equal
	
	// CONSTRUCTOR
	
	function $V(dims, a) {
		dims = (typeof dims === 'number') ? [dims] : dims;
		var v = new Float32Array(	_lengthFromDims(dims)	);
		v.dims = dims;
		
		v.print		= print;
		v.toString	= toString;
		v.clone		= clone;
		v.equal		= equal;
		
		// BOTH
		v.add		= add;
		v.sub		= sub;
		v.mus		= mus;
		v.div		= div;
		v.mul		= mul
		v.t			= t;
		
		if (dims.length === 1 || dims[0] === 1 || dims[1] === 1) {
			v.len		= len;
			v.lenSq		= lenSq;
			v.normal	= normal;
			v.dot		= dot;
			//v.cross		= cross;
		}
		else {
			v.get		= get;
			v.set		= set;
		
			// >1D
			//v.det		= det;
			//v.i			= i;
			v.rot		= rot;
		}
		
		if (a instanceof Array) {
			_update.call(v, a);
		}
		else if (typeof a === 'number') {
			for (var i = 0, f = v.length; i < f; ++i) {
				v[i] = a;
			}
		}
		else if (a === 'i' && dims.length === 2 && dims[0] === dims[1]) {
			for (var i = 0; i < dims[0]; ++i) {
				v.set(i, i, 1);
			}
		}
		else if (a !== undefined) {
			throw 'Unsupported argument ' + a;
		}
		
		return v;
	}
	
	// CORE STUFF
	
	function _lengthFromDims(dims) {
		var l = 1;
		for (var i = 0, f = dims.length; i < f; ++i) {
			l *= dims[i];
		}
		return l;
	}
	
	function _checkDims(d1, d2) {
		if (d1.length !== d2.length) {	throw 'Number of dims differ! [' + d1.join(',') + '] [' + d2.join(',') + ']';	}
		for (var i = 0, f = d1.length; i < f; ++i) {
			if (d1[i] !== d2[i]) {	throw 'Dim #' + i + ' differs! [' + d1.join(',') + '] [' + d2.join(',') + ']';	}
		}
	}
	
	function _checkSquared(dims) {
		return dims[0] === dims[1];
	}
	
	function _checkData(d1, d2) {
		for (var i = 0, f = d1.length; i < f; ++i) {
			if (d1[i] !== d2[i]) {	return false;	}
		}
		return true;
	}
		
	// ACCESSORS
	
	function _get() {
		var idx = 0;
		var m = 1;
		for (var i = 0, f = arguments.length; i < f; ++i) {
			idx += arguments[i] * m;
			m *= this.dims[i];
		}
		return idx;
	}
	
	function get() {
		return this[	_get.apply(this, arguments)	];
	}
	
	function _update(a) {
		var x, y, i = 0, f;
		if (this.dims.length === 1) {
			for (i = 0, f = this.length; i < f; ++i) {
				this[i] = a[i];
			}
		}
		else {
			for (x = 0; x < this.dims[0]; ++x) {
				for (y = 0; y < this.dims[1]; ++y) {
					set.call(this, x, y, a[i]);
					++i;
				}
			}
		}
		
		return this;
	}
	
	function set(a) {
		if (a instanceof Array) {
			this._update(a);
		}
		else {		
			var args = Array.prototype.slice.call(arguments);
			var v = args.pop();
			this[	_get.apply(this, args)	] = v;
		}
		return this;
	}
	
	function _nTimes(c, times) {
		var s = '';
		for (; times > 0; --times) {
			s += c;
		}
		return s;
	}
	
	function _pCell(n) {
		//var s = (n > 0 ? ' ' : '') + n.toFixed(1);
		var s = (n > 0 ? ' ' : '') + n.toPrecision(2);
		return _nTimes(' ', 8 - s.length) + s;
	}
	
	function toString() {
		var l, s, i, j;
		
		if (this.dims.length === 1) {
			s = '';
			for (i = 0; i < this.dims[0]; ++i) {
				s += _pCell(this[i]);
			}
			return s;
		}
		else if (this.dims.length === 2) {
			l = '';
			for (i = 0; i < this.dims[0]; ++i) {
				s = '\n';
				for (j = 0; j < this.dims[1]; ++j) {
					s += _pCell(get.call(this, i, j));
				}
				l += s;
			}
			return l;//.substring(1);
		}
		else {
			throw 'Unsupported dims for printing!';
		}
	}
	
	function print(lbl) {
		console.log(	(lbl !== undefined ? lbl : '') + this.toString()	);
		return this;
	}
	
	function clone() {
		var r = $V(this.dims);
		for (var i = 0, f = this.length; i < f; ++i) {
			r[i] = this[i];
		}
		return r;
	}
	
	function equal(b) {
		_checkDims(this.dims, b.dims);
		for (var i = 0, f = this.length; i < f; ++i) {
			if (Math.abs(	this[i] - b[i]	) > _precision) {	return false	}
		}
		return true;
	}
	
	// OPS
	
	function add(b, internal) {
		_checkDims(this.dims, b.dims);
		var r = internal ? this : $V(this.dims);
		for (var i = 0, f = this.length; i < f; ++i) {
			r[i] = this[i] + b[i];
		}
		return r;
	}
	
	function sub(b, internal) {
		_checkDims(this.dims, b.dims);
		var r = internal ? this : $V(this.dims);
		for (var i = 0, f = this.length; i < f; ++i) {
			r[i] = this[i] - b[i];
		}
		return r;
	}
	
	function mus(n, internal) {
		var r = internal ? this : $V(this.dims);
		for (var i = 0, f = this.length; i < f; ++i) {
			r[i] = this[i] * n;
		}
		return r;
	}
	
	function div(n, internal) {
		var r = internal ? this : $V(this.dims);
		for (var i = 0, f = this.length; i < f; ++i) {
			r[i] = this[i] / n;
		}
		return r;
	}
	
	function mul(b) {
		if (this.dims[1] !== b.dims[0]) {	throw '2nd dim o 1st mtx must equal 1st dim of 2nd mtx';	}
		var r = $V(	[this.dims[0], b.dims[1]]	);
		var x, y, i, v;
		for (y = 0; y < r.dims[1]; ++y) {
			for (x = 0; x < r.dims[0]; ++x) {
				v = 0;
				for (i = 0; i < this.dims[1]; ++i) {
					v += get.call(this, x, i) * get.call(b, i, y);
				}
				set.call(r, x, y, v);
			}
		}
		
		return r;
	}
	
	function len() {
		return Math.sqrt(	lenSq.apply(this)	);
	}
	
	function lenSq() {
		switch (this.dims[0]) {
			case 1:		return	this[0]*this[0];
			case 2:		return	this[0]*this[0] + this[1]*this[1];
			case 3:		return	this[0]*this[0] + this[1]*this[1] + this[2]*this[2];
			default:	throw 'Unsupported dims for lenSq!';
		}
	}
	
	function normal(internal) {
		var l = len.apply(this);
		return mus.call(this, l !== 0 ? 1/l : 1, internal);
	}
	
	function t() {
		var b = clone.call(this);
		if (this.dims.length !== 2) {	throw 'Wrong number of dims for t';	}
		b.dims = [	this.dims[1], this.dims[0]	];
		var x, y;
		for (x = 0; x < this.dims[0]; ++x) {
			for (y = 0; y < this.dims[1]; ++y) {
				b.set(y, x, this.get(x, y));
			}
		}
		return b;
	}
	
	function dot(b) {
		_checkDims(this.dims, b.dims);
		var v = 0;
		for (var i = 0, f = this.length; i < f; ++i) {
			v += this[i] * b[i];
		}
		return v;
	}
	
	function cross(b) {
		_checkDims(this.dims, b.dims);
		
		if (this.dims[0] === 2) {
			return this[0] * b[1] - this[1] * b[0];
		}
		else if (this.dims[0] === 3) {
			var r = $V([3]);
			r[0] = this[1] * b[2] - this[2] * b[1];
			r[1] = this[2] * b[0] - this[0] * b[2];
			r[2] = this[0] * b[1] - this[1] * b[0];
		}
		else {
			throw 'cross does not support dim above 3';
		}
	}
	
	function det() {
		throw 'TODO';
	}
	
	function i() {
		throw 'TODO';
	}
	
	function rot(a, axis) {
		if (this.dims.length !== 2) {	throw 'Unsupported dims for rot';	}
		if (!_checkSquared(this.dims)) {	throw 'Matrix must be square'	}
		var c = Math.cos(a),	s = Math.sin(a);
		if (this.dims[0] > 1 && axis === undefined) {
			this.set(0, 0,  c);
			this.set(1, 0,  s);
			this.set(0, 1, -s);
			this.set(1, 1,  c);
		}
		else if (this.dims[0] > 2 && axis === 0) {
			this.set(1, 1,  c);
			this.set(2, 1,  s);
			this.set(1, 2, -s);
			this.set(2, 2,  c);
		}
		else if (this.dims[0] > 2 && axis === 1) {
			this.set(0, 0,  c);
			this.set(0, 2,  s);
			this.set(2, 0, -s);
			this.set(2, 2,  c);
		}
		else if (this.dims[0] > 2 && axis === 2) {
			this.set(0, 0,  c);
			this.set(1, 0,  s);
			this.set(0, 1, -s);
			this.set(1, 1,  c);
		}
		else {
			throw 'Unsupported dims for rot';
		}
		return this;
	}
	
	/*
	
  // Make the matrix upper (right) triangular by Gaussian elimination.
  // This method only adds multiples of rows to other rows. No rows are
  // scaled up or switched, and the determinant is preserved.
  function gaussElim() {
    var M = this.dup(), els;
    var n = this.elements.length, k = n, i, np, kp = this.elements[0].length, p;
    do { i = k - n;
      if (M.elements[i][i] == 0) {
        for (j = i + 1; j < k; j++) {
          if (M.elements[j][i] != 0) {
            els = []; np = kp;
            do { p = kp - np;
              els.push(M.elements[i][p] + M.elements[j][p]);
            } while (--np);
            M.elements[i] = els;
            break;
          }
        }
      }
      if (M.elements[i][i] != 0) {
        for (j = i + 1; j < k; j++) {
          var multiplier = M.elements[j][i] / M.elements[i][i];
          els = []; np = kp;
          do { p = kp - np;
            // Elements with column numbers up to an including the number
            // of the row that we're subtracting can safely be set straight to
            // zero, since that's the point of this routine and it avoids having
            // to loop over and correct rounding errors later
            els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
          } while (--np);
          M.elements[j] = els;
        }
      }
    } while (--n);
    return M;
  },
  
   determinant: function() {
    if (!this.isSquare()) { return null; }
    var M = this.toRightTriangular();
    var det = M.elements[0][0], n = M.elements.length - 1, k = n, i;
    do { i = k - n + 1;
      det = det * M.elements[i][i];
    } while (--n);
    return det;
  },
  
  isSingular: function() {
    return (this.isSquare() && this.determinant() === 0);
  },
  
    // Returns the result of attaching the given argument to the right-hand side of the matrix
  augment: function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    var T = this.dup(), cols = T.elements[0].length;
    var ni = T.elements.length, ki = ni, i, nj, kj = M[0].length, j;
    if (ni != M.length) { return null; }
    do { i = ki - ni;
      nj = kj;
      do { j = kj - nj;
        T.elements[i][cols + j] = M[i][j];
      } while (--nj);
    } while (--ni);
    return T;
  },

  // Returns the inverse (if one exists) using Gauss-Jordan
  inverse: function() {
    if (!this.isSquare() || this.isSingular()) { return null; }
    var ni = this.elements.length, ki = ni, i, j;
    var M = this.augment(Matrix.I(ni)).toRightTriangular();
    var np, kp = M.elements[0].length, p, els, divisor;
    var inverse_elements = [], new_element;
    // Matrix is non-singular so there will be no zeros on the diagonal
    // Cycle through rows from last to first
    do { i = ni - 1;
      // First, normalise diagonal elements to 1
      els = []; np = kp;
      inverse_elements[i] = [];
      divisor = M.elements[i][i];
      do { p = kp - np;
        new_element = M.elements[i][p] / divisor;
        els.push(new_element);
        // Shuffle of the current row of the right hand side into the results
        // array as it will not be modified by later runs through this loop
        if (p >= ki) { inverse_elements[i].push(new_element); }
      } while (--np);
      M.elements[i] = els;
      // Then, subtract this row from those above it to
      // give the identity matrix on the left hand side
      for (j = 0; j < i; j++) {
        els = []; np = kp;
        do { p = kp - np;
          els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
        } while (--np);
        M.elements[j] = els;
      }
    } while (--ni);
    return Matrix.create(inverse_elements);
  },
	*/
	
	// global namespace handles...
	window.$V = $V;
	
})();