var Game = function(color, time){
	this.color=color;
	this.opponent;
	this.map;
	this.time=time;
	this.timefn;
	this.socket;
	this.id;

	this.overlay = function(text){
		var overlay = jQuery('<div id="overlay">'+text+'</div>');
		overlay.appendTo($('#board'));
		$('#board').bind('click', function(){
			$('#overlay').remove();
			$(this).unbind('click');
		});
	};

	this.setId = function(_id){
		this.id=_id;
	};

	this.setSocket=function(sock){
		var game=this;

		this.socket=sock;
		this.socket.on('killed', function(data){
			game.updateKilled(data);
			game.swapTurn('Your Turn');
		});
		this.socket.on('swaped', function(data){
			game.updateMoved(data);
			game.swapTurn('Your Turn');
		});
		this.socket.on('timedout', function(color){
			if(game.color===color){
				$('#overlay').remove();
				game.swapTurn('Your Opponent Timed Out');
			}else{
				$('#overlay').remove();
				game.overlay('Turn Timed Out');
				$('turn').html(game.opponent);
				game.endTimer();
				game.lockout();
			}
		});
		this.socket.on('start', function(){
			var state=$('state');

			$(state).removeClass('notactive');
			$(state).addClass('active');
			$(state).html("Active");

			if(game.color==='white'){
				game.startTimer();
				game.overlay('Your Turn');
				game.unlock();
			}
		});
		this.socket.on('quit', function(){
			game.overlay("You Win Opponent Forfeits");
			game.endTimer();
			game.lockout();
		});
		this.socket.on('revive', function(data){
			game.updatePiece(data);
			game.swapTurn('Your Turn');
		});
		this.socket.on('pawnEndKilled', function(data){
			game.updateKilled(data);
		});
		this.socket.on('pawnEndSwapped', function(data){
			game.updateMoved(data);
		});
		this.socket.on('loser', function(){
			game.loser();
		});
		this.socket.on('lockout', function(){
			game.lockout();
			game.overlay('Refresh Page to Continue');
		});
	};

	this.getTile=function(mv){
		return $('td')[mv];
	};

	this.getPiece=function(mv){
		return $('piece')[mv];
	};
};

Game.prototype.swapTurn = function(text){
	this.startTimer();
	this.overlay(text);
	this.unlock();
	$('turn').html(this.color);
};

Game.prototype.getTime = function(){
	var game=this;

	$.ajax({
		url: '/getTime',
		type: 'POST',
		data: {id: this.id}
	}).done(function(timeObj){
		if(timeObj&&timeObj.time){
			var date=Date.parse(new Date());
			var end=date+game.time-(date-timeObj.time);
			game.timefn=setInterval(game.setTimer.bind(game, end), 1000);
		}
	});
};

Game.prototype.checkTime = function(){
	var game=this;

	$.ajax({
		url: '/getTime',
		type: 'POST',
		data: {id: this.id}
	}).done(function(timeObj){
		var timeLapse=Date.parse(new Date())-timeObj.time;
		console.log(timeLapse, game.time, timeObj.time);
		if(timeLapse>game.time){
			return 1;
		}
		return 0;
	});
};

Game.prototype.setTimer = function(end){
	var total = (end-Date.parse(new Date()))/1000;
	var timeObj = this.parseTime(total);

	$('#clock').html(
		'minutes: '+timeObj.min+
		' seconds: '+timeObj.sec);

	if(total<=0){
		clearInterval(this.timefn);
		if(this.checkTime())
			window.location.replace("/");
	}
};

Game.prototype.parseTime = function(seconds){
	var timeObj={
		min: (seconds/60) | 0,
		sec: (seconds%60) | 0
	};

	return timeObj;
};

Game.prototype.startTimer = function(){
	var end = Date.parse(new Date())+this.time;
	this.timefn=setInterval(this.setTimer.bind(this, end), 1000);
};

Game.prototype.endTimer = function(){
	clearInterval(this.timefn);
	$('#clock').html('N/A');
};

Game.prototype.isActive = function(){
	if($('state').text()==="Not Started")
		return false;

	return true;
};

Game.prototype.convertMap = function(){
	if(this.color==='black')
		return this.map.slice(0, 64);
	
	return this.map.slice(0, 64).reverse();
};

Game.prototype.saveState = function(){
	$.ajax({
		url: '/saveMove/',
		type: 'POST',
		data: {
			turn: this.opponent,
			board: this.convertMap(),
			id: this.id,
			time: this.time
		}
	});
};

Game.prototype.quit = function(){
	this.eraseGame();
	this.socket.emit('quit', this.id);
	window.location.href="/";
};

Game.prototype.eraseGame = function(){
	$.ajax({
		url: '/delGame/',
		type: 'POST',
		data: {id: this.id}
	});
};

Game.prototype.updateMoved = function(data){
	var pos=63-data.pos;
	var mv=63-data.mv;
	var next=this.getTile(mv);

	swapPiece.call($('piece')[pos], next, pos, mv, this);
};

Game.prototype.updateKilled = function(data){
	var pos=63-data.pos;
	var mv=63-data.mv;
	var next=this.getTile(mv);

	killPiece.call($('piece')[pos], next, pos, mv, this);
};

Game.prototype.unlock = function(){
	this.setRules();
};

Game.prototype.lockout = function(){
	deactivate('highlight');
	deactivate('highlight-enemy');
	$('piece').unbind();
};

Game.prototype.joinGame = function(){
	this.socket.emit('join', this.id, this.time);	
};

Game.prototype.swap = function(pos, mv){
	this.socket.emit('swapPiece', {
		id:this.id, 
		pos:pos, 
		mv:mv, 
		turn:this.turn,
		time:this.time
	});
	this.endTurn();
};

Game.prototype.pawnEndKilled = function(pos, mv){
	this.socket.emit('pawnEndKilled', {
		id:this.id, 
		pos:pos, 
		mv:mv
	});
};

Game.prototype.pawnEndSwapped = function(pos, mv){
	this.socket.emit('pawnEndSwapped', {
		id:this.id, 
		pos:pos, 
		mv:mv
	});
};

Game.prototype.kill = function(pos, mv){
	this.socket.emit('killPiece', {
		id:this.id, 
		pos:pos, 
		mv:mv, 
		turn:this.turn,
		time:this.time
	});
};

Game.prototype.endTurn = function(){
	this.endTimer();
	this.saveState();
	this.lockout();
};

Game.prototype.loser = function(){
	$('#overlay').remove();
	clearInterval(this.timefn);
	this.overlay("You Lost");
	this.lockout();
};

Game.prototype.winner = function(){
	clearInterval(this.timefn);
	this.lockout();
	this.eraseGame();
	this.overlay("You Won");

	this.socket.emit('winner', this.id);
};

Game.prototype.createMap = function(){
	this.map=[];
	var pieces=$('piece');
	var size=pieces.length;
	var pieceName;

	//if(size!===64)

	for(var i=0; i<size; i++){
		pieceName=getClassNames(pieces[i]);
		if(pieceName)
			pieceName=mapKey(pieceName);

		this.map[pieceName]=i;
		this.map[i]=pieceName;
	}
};

Game.prototype.revive = function(piece, pieceCode, mv){
	this.socket.emit('revive', {
		id:this.id, 
		piece:piece, 
		pieceCode:pieceCode,
		mv:mv,
		time:this.time, 
		turn:this.opponent
	});
	this.endTurn();
};

Game.prototype.displayDead = function(piece, pos, mv){
	var dead=this.findDead();
	var size=dead.length;
	var game=this;
	var map=this.map;

	if(size){
		var body='<div id="dead"><table><tr>';

		for(var i=0; i<size; i++)
			body+='<td>'+dead[i]+'</td>';

		var overlay = jQuery(body+'</tr></table></div>');
		overlay.appendTo($('#board'));

		$('#dead').find('piece').bind('click', function(){			
			var pieceTile = game.getTile(mv);
			var piece = mapKey(getClassNames(this));
			var original = game.map[mv];
			game.map[original]=undefined;
			game.map[mv]=piece;
			game.map[piece]=mv;

			$(pieceTile).empty();
			$(pieceTile).append(this);
			$('#dead').remove();

			game.revive(piece, $(pieceTile).html(), mv);
		});
	}else{
		this.socket.emit('noSwap', {id:this.id, time:this.time, turn:this.opponent});
		this.endTurn();
	}
};

Game.prototype.updatePiece = function(data){
	var piece = data.piece;
	var mv = 63-data.mv;
	var original = this.map[mv];
	var pieceTile;

	this.map[piece]=mv;
	this.map[mv]=data.piece;
	this.map[original]=undefined;

	pieceTile = this.getTile(mv);
	$(pieceTile).empty();
	$(pieceTile).append(jQuery(data.pieceCode));
};

Game.prototype.findDead = function(){
	var map=this.map;
	var color=this.color;
	var piece;
	var dead=[];

	piece="rook "+color+" pos-";
	if(!map[piece+"l"])
		dead.push('<piece class="'+piece+'l glyphicon glyphicon-tower"></piece>');
	if(!map[piece+"r"])
		dead.push('<piece class="'+piece+'r glyphicon glyphicon-tower"></piece>');

	piece="knight "+color+" pos-";
    if(!map[piece+"l"])
		dead.push('<piece class="'+piece+'l glyphicon glyphicon-knight"></piece>');
	if(!map[piece+"r"])
		dead.push('<piece class="'+piece+'r glyphicon glyphicon-knight"></piece>');

	piece="bishop "+color+" pos-";
    if(!map[piece+"l"])
		dead.push('<piece class="'+piece+'l glyphicon glyphicon-bishop"></piece>');
	if(!map[piece+"r"])
		dead.push('<piece class="'+piece+'r glyphicon glyphicon-bishop"></piece>');

    if(!map["queen "+color+" pos-c"])
    	dead.push('<piece class="queen '+color+' pos-c glyphicon glyphicon-queen"></piece>');

    return dead;
}

Game.prototype.setTeam = function(turn){
	$('#gameStatsBox').toggle();

	$('#gameStats').bind('click', function(){
		$('#gameStatsBox').toggle();
	});

	$('#quit').bind('click', this.quit.bind(this));

	var color=this.color;
	if(color==='black')
		this.opponent='white';
	else
		this.opponent='black';

	if(this.isActive()){
		this.joinGame();
		if(turn===color){
			this.getTime();
			this.overlay('Your Turn');
			this.setRules();
		}
	}
};

Game.prototype.setRules = function(){
	pawnRules(this);
	rookRules(this);
	knightRules(this);
	bishopRules(this);
	kingRules(this);
	queenRules(this);
};

function deactivate(className){
	var deactivate=$('.'+className);
	var size=deactivate.length;

	for(var i=0; i<size; i++){
		$(deactivate[i]).unbind('click');
		$(deactivate[i]).toggleClass(className);
	}
}

/////////////////////////////////////////////////////////////////

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


function pawnMove(piece, mv, game, pos){
	var next;

	for(var i=0; i<2; i++){
		next=game.map[mv];

		if(!next){
			next=game.getTile(mv);

			if($(next).hasClass('highlight'))
				$(next).unbind('click');
			else
				$(next).bind('click', pawnSwap.bind(piece, next, pos, mv, game));
			
			$(next).toggleClass('highlight');
		}

		if(mv<=39)
			break;

		mv-=8;
	}
}

function pawnAttack(piece, mv, game, pos){
	var next=game.map[mv];
	
	if(next){
		if(next.split(' ')[1]===game.opponent){
			next=game.getTile(mv);

			if($(next).hasClass('highlight-enemy'))
				$(next).unbind('click');
			else
				$(next).bind('click', pawnKill.bind(piece, next, pos, mv, game));

			$(next).toggleClass('highlight-enemy');
		}
	}
}

function move(piece, mv, game, pos){
	var next=game.map[mv];

	if(next){
		if(next.split(' ')[1]===game.opponent){
			next=game.getTile(mv);

			if($(next).hasClass('highlight-enemy'))
				$(next).unbind('click');
			else
				$(next).bind('click', killMove.bind(piece, next, pos, mv, game));

			$(next).toggleClass('highlight-enemy');
		}
		return 1;
	}

	next=game.getTile(mv);
	if($(next).hasClass('highlight'))
		$(next).unbind('click');
	else
		$(next).bind('click', swapMove.bind(piece, next, pos, mv, game));
	
	$(next).toggleClass('highlight');
	return 0;
}

function pawnSwap(next, pos, mv, game){
	swapPiece.call(this, next, pos, mv, game);
	if(mv<8){
		game.pawnEndSwapped(pos, mv);
		game.displayDead(this, pos, mv);
	}
	else
		game.swap(pos, mv);
}

function pawnKill(next, pos, mv, game){
	killPiece.call(this, next, pos, mv, game);
	if(mv<8){
		game.pawnEndKilled(pos, mv);
		game.displayDead(this, pos, mv);
	}
	else{
		game.kill(pos, mv);	
		game.endTurn();
	}
}

function swapMove(next, pos, mv, game){
	swapPiece.call(this, next, pos, mv, game);
	game.swap(pos, mv);
}

function killMove(next, pos, mv, game){
	killPiece.call(this, next, pos, mv, game);

	game.kill(pos, mv);
	if(!game.map['king '+game.opponent+' pos-c']){
		$(game.getTile(mv)).addClass('defeat');
		game.winner();
	}
	else
		game.endTurn();
}

/////////////////////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////////

function pawnRules(game){
	var pawns=$(".pawn."+game.color);
	var size=pawns.length;
	for(var i=0; i<size; i++){
		$(pawns[i]).bind('click', newPawnRule.bind(pawns[i], game));
	}
}

function newPawnRule(game){
	var pos=findLocation(this, game.map);

	pawnMove(this, pos-8, game, pos);
	if((pos-7)%8)
		pawnAttack(this, pos-7, game, pos);
	if((pos-8)%8)
		pawnAttack(this, pos-9, game, pos);
}

function rookRules(game){
	var rooks=$(".rook."+game.color);
	var size=rooks.length;

	for(var i=0; i<size; i++){
		$(rooks[i]).bind('click', newRookRule.bind(rooks[i], game));	
	}
}

function newRookRule(game){
	var pos=findLocation(this, game.map);
	forward(this, game, pos);
	left(this, game, pos);
	right(this, game, pos);
	backward(this, game, pos);
}

function bishopRules(game){
	var bishops=$(".bishop."+game.color);
	var size=bishops.length;

	for(var i=0; i<size; i++){
		$(bishops[i]).bind('click', newBishopRule.bind(bishops[i], game));	
	}
}

function newBishopRule(game){
	var pos=findLocation(this, game.map);
	diagnolFL(this, game, pos);
	diagnolFR(this, game, pos);
	diagnolBL(this, game, pos);
	diagnolBR(this, game, pos);
}

function knightRules(game){
	var knights=$(".knight."+game.color);
	var size=knights.length;

	for(var i=0; i<size; i++){
		$(knights[i]).bind('click', newKnightRule.bind(knights[i], game));
	}
}

function newKnightRule(game){
	var pos=findLocation(this, game.map);
	
	upL(this, game, pos);
	lUp(this, game, pos);
	lDn(this, game, pos);
	upR(this, game, pos);
	dnL(this, game, pos);
	dnR(this, game, pos);
	rUp(this, game, pos);
	rDn(this, game, pos);
}

function kingRules(game){
	var king=$(".king."+game.color)[0];
	$(king).bind('click', kingMoves.bind(king, game));
}

function kingMoves(game){
	var pos=findLocation(this, game.map);
	var sideL=(pos%8);
	var sideR=((pos+1)%8);

	if(pos>7){
	 	move(this, pos-8, game, pos);
	 	if(sideL)
	 		move(this, pos-9, game, pos);
	 	if(sideR)
	 		move(this, pos-7, game, pos);
	}
	if(pos<56){
	 	move(this, pos+8, game, pos);
	 	if(sideL)
	 		move(this, pos+7, game, pos);
	 	if(sideR)
	 		move(this, pos+9, game, pos);
	}
	if(sideL)
	 	move(this, pos-1, game, pos);
	if(sideR)
	 	move(this, pos+1, game, pos);
}

function queenRules(game){
	var queen=$(".queen."+game.color)[0];
	$(queen).bind('click', queenMoves.bind(queen, game));
}

function queenMoves(game){
	var pos=findLocation(this, game.map);
	
	diagnolFL(this, game, pos);
	diagnolFR(this, game, pos);
	diagnolBL(this, game, pos);
	diagnolBR(this, game, pos);
	forward(this, game, pos);
	left(this, game, pos);
	right(this, game, pos);
	backward(this, game, pos);
}

/////////////////////////////////////////////////////////////////

function lUp(piece, game, pos){
	if(!((pos-1)%8)||!(pos%8)||pos<10)
		return;

	move(piece, pos-10, game, pos);
}

function lDn(piece, game, pos){
	if(!((pos-1)%8)||!(pos%8)||pos>55)
		return;

	move(piece, pos+6, game, pos);
}

function rUp(piece, game, pos){
	if(!((pos+2)%8)||!((pos+1)%8)||pos<8)
		return;

	move(piece, pos-6, game, pos);
}

function rDn(piece, game, pos){
	if(!((pos+2)%8)||!((pos+1)%8)||pos>53)
		return;

	move(piece, pos+10, game, pos);
}

function dnR(piece, game, pos){
	if(!((pos+1)%8)||pos>46)
		return;

	move(piece, pos+17, game, pos);
}

function dnL(piece, game, pos){
	if(!(pos%8)||pos>47)
		return;

	move(piece, pos+15, game, pos);
}

function upL(piece, game, pos){
	if(!(pos%8)||pos<17)
		return;

	move(piece, pos-17, game, pos);
}

function upR(piece, game, pos){
	if(!((pos+1)%8)||pos<16)
		return;

	move(piece, pos-15, game, pos);
}

function diagnolFR(piece, game, pos){
	var mv=pos;

	while(mv>0&&(mv+1)%8){
		mv-=7;
		if(move(piece, mv, game, pos))
			break;
	}
}

function diagnolFL(piece, game, pos){
	var mv=pos;

	while(mv>0&&mv%8){
		mv-=9;
		if(move(piece, mv, game, pos))
			break;
	}
}

function diagnolBL(piece, game, pos){
	var mv=pos;

	while(mv<55&&mv%8){
		mv+=7;
		if(move(piece, mv, game, pos))
			break;
	}
}

function diagnolBR(piece, game, pos){
	var mv=pos;

	while(mv<55&&(mv+1)%8){
		mv+=9;
		if(move(piece, mv, game, pos))
			break;
	}
}

function forward(piece, game, pos){
	var mv=pos;

	while(mv>7){
		mv-=8;
		if(move(piece, mv, game, pos))
			break;
	}
}

function left(piece, game, pos){
	var mv=pos;

	while(mv%8){
		mv--;
		if(move(piece, mv, game, pos))
			break;
	}
}

function right(piece, game, pos){
	var mv=pos;

	while((mv+1)%8){
		mv++;
		if(move(piece, mv, game, pos))
			break;
	}
}

function backward(piece, game, pos){
	var mv=pos;

	while(mv<56){
		mv+=8;
		if(move(piece, mv, game, pos))
			break;
	}
}
