GS = {};


/**
 * .item(i)			-> .items[i]
 * .getWasOrdered()	-> .wasOrdered
 */


GS.OrderedPair = function(a, b) {
	if (a === undefined) {
		a = b;
		b = undefined;
	}
	
	if (a !== undefined && b !== undefined) {
		this.items = (a < b) ? [a, b] : [b, a];
	}
	else {
		this.items = [a, b];
		if (a === b) throw 'OrderedPair: ctor received 2 equals numbers!';
	}
};



GS.OrderedPair.prototype = {
	
	clone: function(o) {
		return new GS.OrderedPair(this.items[0], this.items[1]);
	},
	
	length: function() {
		if (this.items[1] !== undefined) return 2;
		if (this.items[0] !== undefined) return 1;
		return 0;
	},
	
	addItem: function(n) {
		var l = this.length();
		
		if (l > 1) throw 'OrderedPair: addItem() already has 2 items!';
		
		if (l === 0) {
			this.items[0] = n;
			return;
		}
		
		if (n > this.items[0]) {
			this.items[1] = n;
		}
		else {
			this.items[1] = this.items[0];
			this.items[0] = n;
		}
	},
	
	/**
	 * When a method that is expected to return OrderedPair returns NULL,
	 * C++ calls the OrderedPair(int) constructor, generating an OrderedPair like this: [0].
	 * The method that receives this result should then call edge.isNull() instead of doing (edge == NULL).
	 */
	/*isNull: function() {
		return (this.length() === 1 && this.item[0] === 0);
	},
	
	hashCode: function() {
		return this.items[0] + this.items[1]*100;
	},*/
	
	equals: function(other) {
		return this.items[0] === other.items[0] && this.items[1] === other.items[1];
	},
	
	toString: function() {
		var l = this.length();
		if (l === 2) return '[' + this.items[0] + ', ' + this.items[1] + ']';
		if (l === 1) return '[' + this.items[0] + ']';
		return '[]';
	}
	
	/*
	bool OrderedPair::operator()( OrderedPair op1, OrderedPair op2 ) const {
	return op1.hashCode() < op2.hashCode();
	}
	*/
	
};
