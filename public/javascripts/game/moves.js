
var Moves = function(game){
	var rowEnd=8;
	var game=game;
	
	var boundaries={
		forward: 7,
		left_right: 8,
		backward: 56
	};

	var moves={
		forward: -8,
		backward: 8,
		left: -1,
		right: 1,
		diagnolUL: -9,
		diagnolUR: -7,
		diagnolDL: 7,
		diagnolDR: 9
		//knight * 8
	};

	var KingMoves = function(piece){
		var pos=findLocation(piece, game.map);
		this.forward(pos);
		this.backward(pos);
		this.diagnolForwardLeft(pos);
		this.diagnolForwardRight(pos);
		this.diagnolBackwardLeft(pos);
		this.diagnolBackwardRight(pos);
		this.left(pos);
		this.right(pos);
	};

	var QueenMoves = function(piece){
		var pos=findLocation(piece, game.map);
		this.repeatedDiagnolForwardLeft(pos);
		this.repeatedDiagnolForwardRight(pos);
		this.repeatedDiagnolBackwardLeft(pos);
		this.repeatedDiagnolBackwardRight(pos);
		this.repeatedForward(pos);
		this.repeatedBackward(pos);
		this.repeatedLeft(pos);
		this.repeatedRight(pos);
	};

	var RookMoves = function(piece){
		var pos=findLocation(piece, game.map);
		this.repeatedForward(pos);
		this.repeatedBackward(pos);
		this.repeatedLeft(pos);
		this.repeatedRight(pos);
	};

	var BishopMoves = function(piece){
		var pos=findLocation(piece, game.map);
		this.repeatedDiagnolForwardLeft(pos);
		this.repeatedDiagnolForwardRight(pos);
		this.repeatedDiagnolBackwardLeft(pos);
		this.repeatedDiagnolBackwardRight(pos);
	};

	var KnightMoves = function(piece){
		var pos=findLocation(piece, game.map);
		this.leftUp(pos);
		this.rightUp(pos);
		this.leftDown(pos);
		this.rightDown(pos);
		this.upLeft(pos);
		this.downLeft(pos);
		this.upRight(pos);
		this.downRight(pos);
	};

	var PawnMoves = function(piece){
		var pos=findLocation(piece, this.game.map);
		this.forward(pos);
		if((pos-1)%this.boundaries.left_right&&pos>this.boundaries.forward)
			pawnAttack(pos-7, pos);
		if((pos%this.boundaries.left_right)&&pos>this.boundaries.forward)
			pawnAttack(pos-9, pos);
	};

	var cantMove = function(king){
		var pos=findLocation(king);

		var next;
		next=this.game.getPiece(pos+this.moves.forward);
		next=this.game.getPiece(pos+this.moves.backward);
		next=this.game.getPiece(pos+this.moves.left_right);
		next=this.game.getPiece((pos-1)+this.moves);
		next=this.game.getPiece(pos);
		next=this.game.getPiece(pos);
		next=this.game.getPiece(pos);
		next=this.game.getPiece(pos);
	}
};

Moves.prototype.setGame = function(game){
	this.game=game;
};

Moves.prototype.leftUp = function(pos){
	if(((pos%this.boundaries.left_right)==2)||pos<10)
		return;

	this.move(pos-10, pos);
};

Moves.prototype.leftDown = function(pos){
	if((((pos+1)%this.boundaries.left_right)==2)||pos>55)
		return;

	this.move(pos+6, pos);
};

Moves.prototype.rightUp = function(pos){
	if((((pos+1)%this.boundaries.left_right)==2)||pos<this.rowEnd)
		return;

	this.move(pos-6, pos);
};

Moves.prototype.rightDown = function(pos){
	if((((pos+1)%this.boundaries.left_right)==2)||pos>53)
		return;

	this.move(pos+10, pos);
};

Moves.prototype.downRight = function(pos){
	if((((pos+1)%this.boundaries.left_right)==2)||pos>46)
		return;

	this.move(pos+17, pos);
};

Moves.prototype.downLeft = function(pos){
	if(((pos%this.boundaries.left_right)==2)||pos>47)
		return;

	this.move(pos+15, pos);
};

Moves.prototype.upLeft = function(pos){
	if(((pos%this.boundaries.left_right)==2)||pos<17)
		return;

	this.move(pos-17, pos);
};

Moves.prototype.upRight = function(pos){
	if(!((pos+1)%this.boundaries.left_right)||pos<16)
		return;

	this.move(pos-15, pos);
};

Moves.prototype.diagnolFowardRight = function(pos){
	if(mv>this.boundaries.forward&&((mv+1)%this.boundaries.left_right))
		this.move(mv+this.moves.diagnolUR, pos);
};

Moves.prototype.repeatedDiagnolFowardRight = function(pos){
	var mv=pos;

	while(mv>this.boundaries.forward&&((mv+1)%this.boundaries.left_right)){
		mv+=this.diagnolUR;
		if(this.move(mv, pos))
			break;
	}
};

Moves.prototype.repeatedDiagnolFowardLeft = function(pos){
	var mv=pos;

	while(mv>this.boundaries.forward&&(mv%this.boundaries.left_right)){
		mv+=this.moves.diagnolUL;
		if(this.move(mv, pos))
			break;
	}
};

Moves.prototype.diagnolFowardLeft = function(pos){
	if(mv>this.boundaries.forward&&(mv%this.boundaries.left_right))
		this.move(mv+this.moves.diagnolUL, pos);
};

Moves.prototype.repeatedDiagnolBackLeft = function(pos){
	var mv=pos;

	while(mv<this.boundaries.backward&&(mv%this.boundaries.left_right)){
		mv+=this.moves.diagnolDL;
		if(this.move(mv, pos))
			break;
	}
};

Moves.prototype.diagnolBackLeft = function(pos){
	if(mv<this.boundaries.backward&&(mv%this.boundaries.left_right))
		this.move(mv+this.moves.diagnolDL, pos);
};

Moves.prototype.repeatedDiagnolBackRight = function(pos){
	var mv=pos;

	while(mv<this.boundaries.backward&&((mv+1)%this.boundaries.left_right)){
		mv+=this.moves.diagnolDR;
		if(this.move(mv, pos))
			break;
	}
};

Moves.prototype.diagnolBackRight = function(pos){
	if(mv<this.boundaries.backward&&((mv+1)%this.boundaries.left_right))
		this.move(mv+this.moves.diagnolUR, pos);
};

Moves.prototype.repeatForward = function(pos){
	var mv=pos;

	while(mv>this.boundaries.forward){
		mv+=this.moves.forward;
		if(this.move(mv, pos))
			break;
	}
};

Moves.prototype.forward = function(pos){
	if(pos>this.boundaries.forward)
		this.move(pos+this.moves.forward, pos);
};

Moves.prototype.repeatBackward = function(pos){
	var mv=pos;

	while(mv<this.boundaries.backward){
		mv+=this.moves.backward;
		if(this.move(mv, pos))
			break;
	}
};

Moves.prototype.backward = function(pos){
	if(pos<this.boundaries.backward)
		this.move(pos+this.moves.backward, pos);
};

Moves.prototype.repeatedLeft = function(pos){
	var mv=pos;

	while(mv%this.boundaries.left_right){
		mv+=this.moves.left;
		if(this.move(mv, pos))
			break;
	}
};

Moves.prototype.left = function(pos){
	if(pos%this.boundaries.left_right)
		this.move(pos+this.moves.left, pos);
};

Moves.prototype.repeatedRight = function(pos){
	var mv=pos;

	while((mv+1)%this.boundaries.left_right){
		mv+=this.moves.right;
		if(this.move(mv, pos))
			break;
	}
};

Moves.prototype.right = function(pos){
	if((pos+1)%this.boundaries.left_right)
		this.move(pos+this.moves.right, pos);
};

Moves.prototype.move = function(mv, pos){
	var game=this.game;
	var next=game.getPiece(mv);

	if(next&&next.split(' ')[1]===game.opponent){
		next=game.getTile(mv);

		if($(next).hasClass('highlight-enemy'))
			$(next).unbind('click');
		else
			$(next).bind('click', function(){
				killPiece(game.getTile(pos), next, pos, mv);
				game.socket.send('killPiece', {
					id: game.id,
					turn: game.turn,
					time: game.moveTime,
					pos: pos, 
					mv: mv
				});
			});

		$(next).toggleClass('highlight-enemy');

		return 1;
	}
	else if($(next).hasClass('highlight'))
		$(next).unbind('click');
	else
		$(next).bind('click', function(){
			swapPiece(this.getTile(pos), next, pos, mv);
			game.swap(pos, mv);
			game.socket.send('swapPiece', {
				id: game.id,
				turn: game.turn,
				time: game.moveTime,
				pos: pos,
				mv: mv
			});
			game.endTurn();
		});
		
	$(next).toggleClass('highlight');

	return 0;
}

Moves.prototype.pawnMove = function(mv, pos){
	var game=this.game;
	var piece=game.getTile(pos);
	var next;

	for(var i=0; i<2; i++){
		next=game.map[mv];

		if(!next){
			next=game.getTile(mv);

			if($(next).hasClass('highlight'))
				$(next).unbind('click');
			else
				$(next).bind('click', swapPiece.bind(piece, next, pos, mv, game));
			
			$(next).toggleClass('highlight');
		}

		if(mv<=39)
			break;

		mv+=this.moves.forward;
	}
};

Moves.prototype.pawnAttack = function(mv, pos){
	var game=this.game;
	var next=game.map[mv];

	if(next&&next.split(' ')[1]===game.opponent){
		next=game.getPiece(mv);

		if($(next).hasClass('highlight-enemy'))
			$(next).unbind('click');
		else
			$(next).bind('click', function(){
				killPiece(next, pos, mv, game);
				game.socket.send('killPiece', {
					id: game.id,
					turn: game.turn,
					time: game.moveTime,
					pos: pos, 
					mv: mv
				});
				if(mv<8){
					game.displayDead(this, pos, mv);
				}else{
					game.endTurn();
				}
			});

		$(next).toggleClass('highlight-enemy');
	}
};

function killPiece(next, pos, mv, game){
	var map=game.map;
	var enemy=map[mv];
	var piece=map[pos];
	var newpiece=game.getTile(pos);

	deactivate('highlight');
	deactivate('highlight-enemy');

	$(this).fadeOut(500, function(){
		$(this).css("visibility", "hidden");
		$(this).fadeIn('fast', function(){
			next.removeChild(next.firstChild);
			$(next).append(this);
			$(newpiece).html("<piece></piece>");
        	$(this).css("visibility", "visible");
    	});
	});

	map[mv]=map[pos];
	map[pos]=undefined;

	map[piece]=mv;
	map[enemy]=undefined;
}

function swapPiece(next, pos, mv, game){
	var map=game.map
	var piece=map[pos];
	var newpiece=game.getTile(pos);

	deactivate('highlight');
	deactivate('highlight-enemy');
	
	$(this).fadeOut(500, function(){
		$(this).css("visibility", "hidden");
		$(next).empty();
		$(next).append(this);
		$(newpiece).html("<piece></piece>");
		
		$(this).fadeIn("fast", function(){
        	$(this).css("visibility", "visible");
    	});
	});

	map[mv]=map[pos];
	map[pos]=undefined;
	map[piece]=mv;
}

function findLocation(obj, map){
	var className=getClassNames(obj);
	return map[mapKey(className)];
}

function getClassNames(obj){
	var name=obj.getAttribute('class');
	return (name?name.split(' '):undefined);
}

function mapKey(arr){
	return arr[0]+' '+arr[1]+' '+arr[2];
}

function deactivate(className){
	var deactivate=$('.'+className);
	var size=deactivate.length;

	for(var i=0; i<size; i++){
		$(deactivate[i]).unbind('click');
		$(deactivate[i]).toggleClass(className);
	}
}

