var CRD = {};


function permutation(ar) {
	ar = ar.slice();	// clone, so ar isn't destroyed
	var ar2 = [];
	var n;
	while (ar.length > 0) {
		n = parseInt(Math.random() * ar.length, 10);
		ar2.push(	ar.splice(n, 1)[0]	);
	}
	return ar2;
}


CRD.Card = function(nr, suit, backNr) {
	this.nr		= nr		|| '';
	this.suit	= suit		|| '';
	this.backNr	= backNr	|| 'b';
};

CRD.Card.nrs = ['2', '3', '4', '5', '6', '7', '8', '9', '0', 'j', 'q', 'k', '1'];

CRD.Card.nrNames = {
	'2':	'two',
	'3':	'three',
	'4':	'four',
	'5':	'five',
	'6':	'six',
	'7':	'seven',
	'8':	'eight',
	'9':	'nine',
	'0':	'ten',
	'j':	'jack',
	'q':	'queen',
	'k':	'king',
	'1':	'ace'
};

CRD.Card.suits = ['s', 'd', 'h', 'c'];

CRD.Card.suitNames = {
	's':	'spades',
	'd':	'diamonds',
	'h':	'hearts',
	'c':	'clubs'
};

CRD.Card.prototype.toString = function() {
	return this.suit + this.nr;
};

CRD.Card.prototype.clone = function() {
	return new CRD.Card(this.nr, this.suit, this.backNr);
};

CRD.Card.prototype.describe = function() {
	if (!this.nr) {	return '?';	}
	return CRD.Card.nrNames[this.nr] + ' of ' + CRD.Card.suitNames[this.suit];
};

CRD.Card.prototype.turn = function() {
	this.upsideDown = !this.upsideDown;
};

CRD.Card.prototype.getImage = function() {
	if (!this.nr || this.upsideDown) {
		return 'img/cards/b' + this.backNr + '.png';
	}
	return 'img/cards/' + this.suit + this.nr + '.png';
};

CRD.Card.prototype.update = function() {
	if (!this.dom) {
		this.dom = document.createElement('img');
		this.dom.className = 'card';
		document.getElementById('table').appendChild(this.dom);
	}
	this.dom.src = this.getImage();
	this.dom.style.left	= parseInt(this.pos[0], 10) + 'px';
	this.dom.style.top	= parseInt(this.pos[1], 10) + 'px';
};

CRD.Card.prototype.remove = function() {
	if (!this.dom) {	return;	}
	this.dom.parentNode.removeChild(this.dom);
	this.dom = undefined;
};

CRD.Card.prototype.equals = function( c ) {
	return (	(this.nr === c.nr) && (this.suit === c.suit)	);
};



CRD.Deck = function(backNr) {
	this.backNr = backNr;
	this.cards = [];
};

CRD.Deck.prototype.fill = function() {
	var s, n, sf, nf;
	this.cards = [];
	for (s = 0, sf = CRD.Card.suits.length; s < sf; ++s) {
		for (n = 0, nf = CRD.Card.nrs.length; n < nf; ++n) {
			var c = new CRD.Card(CRD.Card.nrs[n], CRD.Card.suits[s], this.backNr);
			this.cards.push( c);
		}
	}
	return this;
};

CRD.Deck.prototype.shuffle = function() {
	var d = [];
	var n;
	while (this.cards.length > 0) {
		n = parseInt(Math.random() * this.cards.length, 10);
		d.push(	this.cards.splice(n, 1)[0]	);
	}
	this.cards = d;
	return this;
};

CRD.Deck.prototype.removeCard = function(card) {
	var c;
	for (var i = 0, f = this.cards.length; i < f; ++i) {
		c = this.cards[i];
		if (c.equals(card)) {
			this.cards.splice(i, 1);
			return this;	// TODO only removes first instance
		}
	}
	return this;
};

CRD.Deck.prototype.getAllOfSuit = function(suit) {
	var c, cs = [];
	for (var i = 0, f = this.cards.length; i < f; ++i) {
		c = this.cards[i];
		if (c.suit === suit) {	cs.push( c );	}
	}
	return cs;
};

CRD.Deck.prototype.getAllFromPlayer = function(playerNr) {
	var c, cs = [];
	for (var i = 0, f = this.cards.length; i < f; ++i) {
		c = this.cards[i];
		if (c.playedBy === playerNr) {	cs.push( c );	}
	}
	return cs;
};

CRD.Deck.prototype.getAllFromPlayerOfSuit = function(playerNr, suit) {
	var c, cs = [];
	for (var i = 0, f = this.cards.length; i < f; ++i) {
		c = this.cards[i];
		if (c.playedBy === playerNr && c.suit === suit) {	cs.push( c );	}
	}
	return cs;
};

CRD.Deck.prototype.count = function() {
	return this.cards.length;
};

CRD.Deck.prototype.toString = function() {
	var s = '';
	for (var i = 0, f = this.cards.length; i < f; ++i) {
		s += this.cards[i] + ' ';
	}
	return s;
};



CRD.Player = function(isAI) {
	this.hand = [];
	this.startPos = [0, 0];
	this.deltaPos = [0, 0];
	this.isAI = isAI;
};

CRD.Player.prototype.placeHand = function() {
	var pos = [	this.startPos[0], this.startPos[1]	];
	if (this.deltaPos[0] > 0) {		pos[0] -= (this.hand.length - 1) * this.deltaPos[0]/2;	}
	if (this.deltaPos[1] > 0) {		pos[1] -= (this.hand.length - 1) * this.deltaPos[1]/2;	}
	var c;
	for (var i = 0, f = this.hand.length; i < f; ++i) {
		c = this.hand[i];
		c.pos = [	pos[0], pos[1]	];
		c.upsideDown = this.isAI;
		c.update();
		pos[0] += this.deltaPos[0];
		pos[1] += this.deltaPos[1];
	}
};

CRD.Player.prototype.clearHand = function() {
	for (var i = 0, f = this.hand.length; i < f; ++i) {
		this.hand[i].remove();
	}
	this.hand = [];
};



window.CRD = CRD;