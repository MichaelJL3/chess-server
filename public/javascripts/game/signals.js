
var Signals = function(game, sock){
	var game=game;
	var socket=sock;
};

Signals.prototype.setSignals = function(){
	if(this.socket){
		this.socket.on('start', this.start());
		this.socket.on('quit', this.quit());
		this.socket.on('loser', this.loser());
		this.socket.on('swapTurn', this.swapTurn());
		this.socket.on('time', this.recvTime(data));
		this.socket.on('revive', this.revive(data));
		this.socket.on('killed', this.killed(data));
		this.socket.on('swaped', this.swaped(data));
		this.socket.on('lockout', this.lockout(color));
		this.socket.on('timedout', this.timedout(color));
	}
};

Signals.prototype.setSocket = function(sock){
	this.socket=sock;
};

Signals.prototype.setGame = function(game){
	this.game=game;
};

Signals.prototype.recvTime = function(data){
	this.game.time.timeObj=data;
};

Signals.prototype.swapTurn = function(data){
	this.game.swapTurn('Your Turn');
};

Signals.prototype.killed = function(data){
	this.game.updateKilled(data);
};

Signals.prototype.swaped = function(data){
	this.game.updateKilled(data);
};

Signals.prototype.loser = function(){
	this.game.loser();
};

Signals.prototype.revive = function(data){
	this.game.updatePiece(data);
	this.game.swapTurn('Your Turn');
};

Signals.prototype.start = function(){
	var state=$('state');

	$(state).removeClass('notactive');
	$(state).addClass('active');
	$(state).html("Active");

	if(this.game.color==='white'){
		this.game.startTimer();
		this.game.overlay('Your Turn');
		this.game.unlock();
	}
};

Signals.prototype.quit = function(){
	this.game.overlay("You Win Opponent Forfeits");
	this.game.endTimer();
	this.game.lockout();
};

Signals.prototype.timedOut = function(color){
	if(this.game.color===color){
		$('#overlay').remove();
		this.game.swapTurn('Your Opponent Timed Out');
	}else{
		$('#overlay').remove();
		this.game.overlay('Turn Timed Out');
		$('turn').html(this.game.opponent);
		this.game.endTimer();
		this.game.lockout();
	}
};

Signals.prototype.lockout = function(color){
	game.lockout();
	game.overlay('Refresh Page to Continue');
};

Signals.prototype.send = function(path, data){
	this.socket.emit(path, data);
};