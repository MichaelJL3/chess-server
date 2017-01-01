
function pawnRules(game){
	var pawns=$(".pawn."+game.color);
	var size=pawns.length;
	for(var i=0; i<size; i++){
		$(pawns[i]).bind('click', game.moves.newPawnRule(pawns[i]));
	}
}

function rookRules(game){
	var rooks=$(".rook."+game.color);
	var size=rooks.length;

	for(var i=0; i<size; i++){
		$(rooks[i]).bind('click', game.moves.newRookRule(rooks[i]));	
	}
}

function bishopRules(game){
	var bishops=$(".bishop."+game.color);
	var size=bishops.length;

	for(var i=0; i<size; i++){
		$(bishops[i]).bind('click', game.moves.newBishopRule(bishops[i]));	
	}
}

function knightRules(game){
	var knights=$(".knight."+game.color);
	var size=knights.length;

	for(var i=0; i<size; i++){
		$(knights[i]).bind('click', game.moves.newKnightRule(knights[i]));
	}
}

function kingRules(game){
	var king=$(".king."+game.color);
	$(king).bind('click', game.moves.kingMoves(king));
}

function queenRules(game){
	var queen=$(".queen."+game.color);
	$(queen).bind('click', game.moves.queenMoves(queen));
}

function check(game){
	var king=$(".king."+game.opponent);
	if(game.moves.cantMove(king)){
		game.socket.send("checkmate", game.id);
	}else{
		game.socket.send("check", game.id);
	}
}