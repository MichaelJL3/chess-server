
var Game = function(color, time, sock, relTime){
	this.socket=new Signals(this, sock);
	this.time=new Timer(this, time, relTime);
	this.moves=new Moves(this);
	this.color=color;
	this.opponent;
	this.map=[];
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

	this.getTile=function(mv){
		return $('td')[mv];
	};

	this.getPiece=function(mv){
		return $('piece')[mv];
	};
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

Game.prototype.unlock = function(){
	this.setRules();
};

Game.prototype.lockout = function(){
	deactivate('highlight');
	deactivate('highlight-enemy');
	$('piece').unbind();
};

Game.prototype.createMap = function(){
	var pieces=$('piece');
	var size=pieces.length;
	var pieceName;

	for(var i=0; i<size; i++){
		pieceName=getClassNames(pieces[i]);
		if(pieceName)
			pieceName=mapKey(pieceName);

		this.map[pieceName]=i;
		this.map[i]=pieceName;
	}
};

Game.prototype.setupGame = function(turn){
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
		this.socket.send('join', {
			id: this.id, 
			time: this.time.time
		});
		if(turn===color){
			this.time.startTimer();
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

Game.prototype.quit = function(){
	this.socket.send('quit', {id: this.id});
	window.location.href="/";
};

Game.prototype.winner = function(){
	this.time.clear();
	this.lockout();
	this.overlay("You Won");

	this.socket.send('winner', this.id);
};

Game.prototype.loser = function(){
	$('#overlay').remove();
	this.time.clear();
	this.overlay("You Lost");
	this.lockout();
};

Game.prototype.swapTurn = function(text){
	this.time.startTimer();
	this.overlay(text);
	this.unlock();
	$('turn').html(this.color);
};

Game.prototype.endTurn = function(){
	this.time.endTimer();
	this.socket.send('save', {
		turn: this.opponent,
		board: this.map.slice(0, 64),
		id: this.id
	});
	this.lockout();
};

Game.prototype.updateMoved = function(data){
	var pos=63-data.pos;
	var mv=63-data.mv;
	var next=this.getTile(mv);

	swapPiece(next, pos, mv);
};

Game.prototype.updateKilled = function(data){
	var pos=63-data.pos;
	var mv=63-data.mv;
	var next=this.getTile(mv);

	killPiece(next, pos, mv);
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

Game.prototype.displayDead = function(pos, mv){
	var piece=this.getPiece(pos);
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
			this.socket.send('revive', {
				id:this.id, 
				piece:piece, 
				pieceCode:$(pieceTile).html(),
				mv:mv,
				time:this.time.time, 
				turn:this.opponent
			});
			this.endTurn();
		});
	}else{
		this.endTurn();
	}
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
