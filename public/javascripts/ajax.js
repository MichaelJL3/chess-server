
function createGame(time, color, user){
	$.post("/newgame", 
		{time:time, color:color, user:user},
		function(id){
			if(id){
				socket.emit('join', id, time);
			}
			$.post("/usersgames", {user:user},
				function(data){
					$('#mainComponent').html(data);
					processBoards();
			});
		});
}

function findGame(time, color, user){
	$.post("/findgames", 
		{time:time, color:color, user:user}, 
		function(data){
			$('#mainComponent').html(data);
	});
}

function joinGame(id, color, user, time){
	socket.emit('join', id, time);	

	$.post("/join", 
		{id:id, color:color, user:user},
		function(data){
			$.post("/game",
				{id:id, user:user}, 
				function(data){
					formatGame(data, id);
					socket.emit('starting', {id:id, time:time*1000});
			});
	});
}

function getGames(user){
	$.post("/usersgames",
		{user:user},
		function(data){
			$('#mainComponent').html(data);
			processBoards();
	});
}

function loadGame(id, user, time){
	$.post("/game",
		{id:id, user:user}, 
		function(data){
			formatGame(data, id);
	});
}

function formatGame(data, id){
	var obj=$('#mainComponent');
	obj.html(data);

	var color=playerColor($('ico')[0]);
	var turn=$('turn').text();
	var time=$('timed').text();

	if(color==='white')
		styleBoardUpsideDown($('#board'));
	else
		styleBoard($('#board'));

	var game=new Game(color, time*1000, socket);
	//game.setSocket(socket);
	game.setId(id);
	game.setupGame(turn);
	game.createMap();	
}