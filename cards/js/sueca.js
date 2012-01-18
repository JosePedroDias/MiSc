/*global CRD:true, mgr:true */

// card dimensions
var dims = [900, 500];
var cDims = [71, 96, 14, 20];

// set deck available cards
CRD.Card.nrs = ['2', '3', '4', '5', '6', 'q', 'j', 'k', '7', '1'];



/*
TODO:
	detectar renúncia
	sortear quem começa e mostra naipe trunfo
	por jogadores a n renunciar...
*/



CRD.SuecaManager = function() {
	var x = (dims[0] - cDims[0]) / 2;
	var y = (dims[1] - cDims[1]) / 2;
	this.potPos = [
		[x,				y + cDims[1]/2],
		[x + cDims[0],	y],
		[x,				y - cDims[1]/2],
		[x - cDims[0],	y]
	];
	this.suitOrders = {
		's':	['d', 'c' ,'h', 's'],
		'h':	['s', 'd', 'c' ,'h'],
		'c':	['h', 's', 'd', 'c'],
		'd':	['c', 'h', 's', 'd']
	};
	this.cardNrPoints		= {'2':0, '3':0, '4':0, '5':0, '6':0, 'q':2, 'j':3, 'k':4, '7':10, '1':11};
	this.score				= [0, 0];
	this.firstToPlay		= parseInt(Math.random() * 4, 10);
	this.nextToPlay			= this.firstToPlay;
	this.players			= undefined;	// once
	this.handNr				= undefined;	// every game
	this.trumpSuit			= undefined;	// every game
	this.handSuit			= undefined;	// every game
	this.teamCards			= undefined;	// every game
	this.cardsInTheTable	= undefined;	// every game
	this.playerSkippedSuits = undefined;	// every game
};

CRD.SuecaManager.prototype.informPlayers = function(o) {
	for (var i = 0; i < 4; ++i) {
		this.players[i].inform(o);
	}
};

/* starts a game (new or not) */
CRD.SuecaManager.prototype.startGame = function() {
	this.handNr				= 0;
	this.teamCards			= [[], []];
	this.cardsInTheTable	= [];
	this.playerSkippedSuits	= [{}, {}, {}, {}];
	
	if (this.trumpCard) {
		this.trumpCard.remove();
		this.trumpCard = undefined;
	}
		
	// new deck
	this.deck = new CRD.Deck('b');
	this.deck.fill();
	this.deck.shuffle();
	
	var p, i, lbl;
	if (!this.players) {	// first game - create players
		this.players = [];
		
		var pp = [	// start, delta
			[	[dims[0]/2 - cDims[0]/2,	dims[1]   - cDims[1]	],		[14,  0]	],
			[	[dims[0]   - cDims[0],		dims[1]/2 - cDims[1]/2	],		[ 0, 20]	],
			[	[dims[0]/2 - cDims[0]/2,	0						],		[14,  0]	],
			[	[0,							dims[1]/2 - cDims[1]/2	],		[ 0, 20]	]
		];
		
		for (i = 0; i < 4; ++i) {
			p = new CRD.Player(i !== 0);
			if (i !== 0) {	this.setAIMind( p );		}	// setAIMind	setRandomMind
			else {			this.setHumanMind( p );		}
			p.playerNr = i;
			p.name = '#' + i;
			p.startPos = pp[i][0];
			p.deltaPos = pp[i][1];
			p.playCard = function(card) {
				mgr.playCard(this.playerNr, card);
			};
			p.getValidCards = function(suit) {
				var r = [];
				var c, i, f;
				for (i = 0, f = this.hand.length; i < f; ++i) {
					c = this.hand[i];
					if (!suit || c.suit === suit) {	r.push( i );	}
				}
				if (r.length === 0) {
					for (i = 0, f = this.hand.length; i < f; ++i) {
						c = this.hand[i];
						r.push( i );
					}
				}
				return r;
			};
			
			lbl = document.getElementById('pl' + i);
			lbl.style.left	= parseInt(p.startPos[0], 10) + 'px';
			lbl.style.top	= parseInt(p.startPos[1], 10) + 'px';
			lbl.innerHTML = p.name;
			this.players.push( p );
		}
		document.getElementById('pointer').className = 'next' + this.nextToPlay;
	}
	else {	// not the first game, start with the following player since previous game
		this.firstToPlay = (this.firstToPlay + 1) % 4;
		this.nextToPlay = this.firstToPlay;
		document.getElementById('pointer').className = 'next' + this.nextToPlay;
	}
	
	// set player hands, starting from first to play
	for (i = 0; i < 4; ++i) {
		p = this.players[ (i + this.firstToPlay) % 4 ];
		if (p.hand) {	p.clearHand();	}
		p.hand = this.deck.cards.splice(0, 10);
		
		// elect trump...
		if (i === 0) {
			var trumpCard = p.hand[0].clone();
			this.trumpSuit = trumpCard.suit;
			trumpCard.pos = [p.startPos[0], p.startPos[1]];
			switch (this.firstToPlay) {
				case 0:		trumpCard.pos[1] -= 30;	break;
				case 1:		trumpCard.pos[0] -= 16;	break;
				case 2:		trumpCard.pos[1] += 30;	break;
				default:	trumpCard.pos[0] += 16;
			}
			trumpCard.update();
			trumpCard.dom.className = 'card trumpCard';
			this.trumpCard = trumpCard;
		}
		
		p.hand.sort(mgr.sortFn);
		p.placeHand();
	}
	
	console.log('First to play is player #' + this.firstToPlay + ', trump suit is: ' + this.trumpSuit);
	
	this.informPlayers({action:'gameStarted', trumpSuit:this.trumpSuit});
	
	this.next();
};

/* sort (for player hands) */
CRD.SuecaManager.prototype.sortFn = function(a, b) {
	var so = mgr.suitOrders[mgr.trumpSuit];
	var va = so.indexOf(a.suit) * 20 + CRD.Card.nrs.indexOf(a.nr);
	var vb = so.indexOf(b.suit) * 20 + CRD.Card.nrs.indexOf(b.nr);
	return va - vb;
};

/* sort (for table hands) */
CRD.SuecaManager.prototype.sortFn2 = function(a, b) {
	var so = mgr.handSuitOrders;
	var va = so.indexOf(a.suit) * 20 + CRD.Card.nrs.indexOf(a.nr);
	var vb = so.indexOf(b.suit) * 20 + CRD.Card.nrs.indexOf(b.nr);
	return va - vb;
};

/* counts points in the given cards */
CRD.SuecaManager.prototype.countPoints = function(cards) {
	var points = 0;
	for (var i = 0, f = cards.length; i < f; ++i) {
		points += this.cardNrPoints[cards[i].nr];
	}
	return points;
};

/* plays the given card and does every logic step as judge (next to play|next hand|ended|renuncia) */
CRD.SuecaManager.prototype.playCard = function(playerNr, card) {
	this.informPlayers({action:'cardPlayed', playedBy:playerNr, card:card});
	
	// position card...
	card.upsideDown = false;
	card.playedBy = playerNr;
	card.pos = this.potPos[playerNr];
	card.update();
	this.cardsInTheTable.push(card);
	
	var winningTeam;
	
	// check renuncia
	if (this.playerSkippedSuits[playerNr][card.suit]) {
		winningTeam = 1 - (playerNr % 2);
		alert('Player #' + playerNr + ' renounced! Other team (#' + winningTeam + ') wins 4 points.');
		
		this.score[winningTeam] += 4;
		document.getElementById('score').innerHTML = this.score[0] + ' | ' + this.score[1];
		
		for (var i = 0; i < this.cardsInTheTable.length; ++i) {
			this.cardsInTheTable[i].remove();
		}
		
		this.startGame();
		return;
	}
	
	if (this.cardsInTheTable.length === 1) {	// 1st card
		this.handSuit = card.suit;
		this.handSuitOrders = [this.trumpSuit];
		if (this.trumpSuit !== this.handSuit) {
			this.handSuitOrders.unshift(this.handSuit);
		}
		//console.log('** hand #' + this.handNr + ' **');
		//console.log('Player #' + playerNr + ' played ' + card.describe() + (card.suit === this.trumpSuit ? ' (trunfo)' : ''));
	}
	else {	// following card...
		var assisted = card.suit === this.handSuit;
		//console.log('Player #' + playerNr + ' played ' + card.describe() + (assisted ? ' (assisted)' : (card.suit === this.trumpSuit ? ' (cutted)' : ' (ditched)')));
		
		// mark renuncia
		if (!assisted) {
			this.playerSkippedSuits[playerNr][this.handSuit] = true;
		}
	}
	
	if (this.cardsInTheTable.length === 4) {	// at end of hand
		// sort hand to check who won it
		var winningCard = this.cardsInTheTable.slice().sort(this.sortFn2);
		winningCard = winningCard[3];
		var winningPlayer = winningCard.playedBy;
		winningTeam = winningPlayer % 2;
		this.nextToPlay = winningPlayer;
		document.getElementById('pointer').className = 'next' + this.nextToPlay;
		winningCard.dom.className += ' winningCard';
		console.log('Hand #' + this.handNr + ' won by player #' + winningPlayer + ' of team #' + winningTeam + '(' + this.cardsInTheTable.join(' ') + ')');
		this.handSuit = undefined;
		
		// remove cards from the table and at them to the winning team...
		var endHand = function() {
			for (var i = 0; i < 4; ++i) {
				this.cardsInTheTable[i].remove();
				this.teamCards[winningTeam].push(	this.cardsInTheTable[i]	);
			}
			this.cardsInTheTable = [];
			++this.handNr;
			
			if (this.handNr === 10) {	// last hand in game. sum up stuff...
				var points = [	this.countPoints(this.teamCards[0]), this.countPoints(this.teamCards[1])	];
				console.log('Team final results:');
				console.log('  Team #0 got ' + points[0] + ' with cards: ' + this.teamCards[0].join(' '));
				console.log('  Team #1 got ' + points[1] + ' with cards: ' + this.teamCards[1].join(' '));
				winningTeam = points[0] > points[1] ? 0 : (points[1] > points[0] ? 1 : -1);
				if (winningTeam !== -1) {
					var grantedPoints = points[winningTeam] > 90 ? 2 : 1;
					console.log('> Team #' + winningTeam + ' won ' + grantedPoints + ' point' + (grantedPoints === 1 ? '' : 's') + '!');
					this.score[winningTeam] += grantedPoints;
					document.getElementById('score').innerHTML = this.score[0] + ' | ' + this.score[1];
				}
				else {
					console.log('> Tied game. Neither team won!');
				}
				
				// prepare new game...
				this.startGame();
				return;
			}
			else if (this.handNr === 2) {	// HIDE trump AFTER 2nd HAND
				this.trumpCard.remove();
				this.trumpCard = undefined;
			}
		};
		
		setTimeout(function() {	endHand.call(mgr);	mgr.next();	}, 2500);
	}
	else {	// during hand...
		this.nextToPlay = (this.nextToPlay + 1) % 4;
		document.getElementById('pointer').className = 'next' + this.nextToPlay;
		this.next();
	}
};

/* orders the next player to play a card... */
CRD.SuecaManager.prototype.next = function() {
	this.players[this.nextToPlay].chooseCard();
};

/* ------------------------------------------------------------- */

CRD.SuecaManager.prototype.setRandomMind = function(o) {
	
	o.inform = function() {};
	
	/**
	 * calls mgr.playCard once card is chosen
	 * player ought to remove it from his hand.
	 */
	o.chooseCard = function() {
		var cs = this.getValidCards(mgr.handSuit);
		var i = parseInt(Math.random() * cs.length, 10);
		var c = this.hand.splice(cs[i], 1)[0];
		this.playCard( c );
		this.placeHand();
	};
};

/* ------------------------------------------------------------- */

CRD.SuecaManager.prototype.setAIMind = function(o) {
	
	/**
	 * data can be:
	 * {action:'gameStarted'}
	 * {action:'cardPlayed', playedBy:playerIndex, card:card}
	 */
	o.inform = function(msg) {
		if		(msg.action === 'gameStarted') {	// reset game data
			this.handNr = 0;
			this.hiddenCards = new CRD.Deck('b').fill();
			for (var i = 0, f = this.hand.length; i < f; ++i) {
				this.hiddenCards.removeCard(	this.hand[i]	);
			}
		}
		else if	(msg.action === 'cardPlayed') {	// memorize game, assert some stuff.. .
		}
	};
	
	/**
	 * calls mgr.playCard once card is chosen
	 * player ought to remove it from his hand.
	 */
	o.chooseCard = function() {
		var cs = this.getValidCards(mgr.handSuit);
		var i = parseInt(Math.random() * cs.length, 10);
		var c = this.hand.splice(cs[i], 1)[0];
		this.playCard( c );
		this.placeHand();
	};
};

/* ------------------------------------------------------------- */

CRD.SuecaManager.prototype.setHumanMind = function(o) {
	o.inform = function(msg) {
		if		(msg.action === 'gameStarted') {	// reset game data
			this.handNr = 0;
			this.cardNr = 0;
			this.hands = [];
			this.handSuit = undefined;
			this.trumpSuit = msg.trumpSuit;
			this.playerSkippedSuits	= [{}, {}, {}, {}];
			
			this.hiddenCards = new CRD.Deck('b').fill();
			this.playedCards = new CRD.Deck('b');
			for (var i = 0, f = this.hand.length; i < f; ++i) {
				this.hand[i].playedBy = 0;
				this.hiddenCards.removeCard(	this.hand[i]	);
				this.playedCards.cards.push(	this.hand[i]	);
			}
		}
		else if	(msg.action === 'cardPlayed') {	// memorize game, assert some stuff…
			// record latest hand to hands
			if (this.cardNr === 0) {
				this.hands.push([]);
			}
			var latestHand = this.hands[this.hands.length-1];
			latestHand.push(msg.card);
			
			// record handSuit and 
			if (this.cardNr === 0) {
				this.handSuit = msg.card.suit;
				this.handHasBeenCut = false;
			}
			else {
				if (msg.card.suit !== this.handSuit) {
					this.playerSkippedSuits[msg.playedBy][this.handSuit] = true;
				}
			}
			
			if (msg.card.suit === this.trumpSuit) {	this.handHasBeenCut = true;	}
			
			// card from other player
			if (msg.playedBy !== 0) {
				// update played(+) and hidden(-) cards
				this.playedCards.cards.push(	msg.card	);
				this.hiddenCards.removeCard(	msg.card	);				
			}
			
			this.winningCard = latestHand.slice().sort(mgr.sortFn2);
			this.winningCard = this.winningCard[this.winningCard.length-1];
			this.winningPlayer = this.winningCard.playedBy;
			this.winningTeam = this.winningPlayer % 2;
			
			// update cardNr (order of play) and handNr
			++this.cardNr;
			if (this.cardNr === 4) {
				++this.handNr;
				this.cardNr = 0;
				this.handSuit = undefined;
			}
		}
	};
	
	o.info = function() {
		var s, cs;
		
		// available cards, by suit...
		for (var si = 0; si < 4; ++si) {
			s = mgr.suitOrders[mgr.trumpSuit][si];
			cs = this.hiddenCards.getAllOfSuit(s);
			if (cs.length > 0) {	console.log('hidden cards of suit ' + s + ': ' + cs.join(' '));	}
			//console.log('  cards played by #1: ' + this.hiddenCards.getAllFromPlayerOfSuit(1, s).join(' '));
			//console.log('  cards played by #2: ' + this.hiddenCards.getAllFromPlayerOfSuit(2, s).join(' '));
			//console.log('  cards played by #3: ' + this.hiddenCards.getAllFromPlayerOfSuit(3, s).join(' '));
		}
		
		// players with dried suits:
		for (var pi = 1; pi < 4; ++pi) {
			cs = Object.keys(this.playerSkippedSuits[pi]);
			if (cs.length > 0) {	console.log('Player #' + pi + ' dried suits: ' + cs.join(' '));	}
		}
		
		console.log('Hand suit: ' + this.handSuit + ', trump suit: ' + this.trumpSuit);
		console.log('Hand has been cut? ' + (this.handHasBeenCut ? 'y' : 'n') );
		console.log('Winning card: ' + this.winningCard + ', player: #' + this.winningPlayer + ', team: #' + this.winningTeam);
		
		var f2p = this.cardNr === 0;
		var l2p = this.cardNr === 3;
		console.log('First to play? ' + (f2p?'y':'n') );
		console.log('Last  to play? ' + (l2p?'y':'n') );
		
		var remainingPlayers = [];
		for (var k = 0; k < 3 - this.cardNr; ++k) {
			remainingPlayers.push(k+1);
		}
		console.log('Remaining players: ' + remainingPlayers.join(' '));
		
		var relevantSuits = [this.trumpSuit];
		if (this.handSuit && this.handSuit != this.trumpSuit) {	relevantSuits.unshift(this.handSuit);	}
		console.log('Relevant suits: ' + relevantSuits.join(' '));
		
		/*console.log('hidden cards, by suit:');
		console.log(	'  ' + this.hiddenCards.getAllOfSuit('s').join(' ')	);
		console.log(	'  ' + this.hiddenCards.getAllOfSuit('h').join(' ')	);
		console.log(	'  ' + this.hiddenCards.getAllOfSuit('c').join(' ')	);
		console.log(	'  ' + this.hiddenCards.getAllOfSuit('d').join(' ')	);
		
		console.log('cards played, by suit:');
		console.log(	'  ' + this.hiddenCards.getAllOfSuit('s').join(' ')	);*/
		
		// relevant suits: handSuit, trumpSuit
		// am I the first to play? -> can I have high prob of winning 
		// am I the last to play? -> s sem indeterminacoes
		// who is winning?
		// who remains playing?
		// has it been cut?
		// who has no cards of a suit?
		
		// prob de ter naipe: nr hidden do naipe / n cartas ??
	};
	
	o.chooseCard = function() {
		var c, cs = this.getValidCards(mgr.handSuit);
		var p = this;
		
		for (var i = 0, f = this.hand.length; i < f; ++i) {
			c = this.hand[i];
			c.dom.setAttribute('hand_nr', i);
			if (cs.indexOf(i) !== -1) {	// VALID
				c.dom.onclick = function(event) {
					var target = event.target || event.srcElement;
					var hi = parseInt(target.getAttribute('hand_nr'), 10);
					var c;
					for (var i = 0, f = p.hand.length; i < f; ++i) {
						c = p.hand[i];
						c.dom.onclick = undefined;
						c.dom.className = 'card';
					}
					c = p.hand.splice(hi, 1)[0];
					p.playCard( c );
					p.placeHand();
				};
				c.dom.className = 'card validCard';
			}
			else {	// INVALID
				c.dom.className = 'card invalidCard';
			}
		}
	};

};

/* ------------------------------------------------------------- */

var mgr = new CRD.SuecaManager();
mgr.startGame();





