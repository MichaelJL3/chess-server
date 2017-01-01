
var socket;

$.getScript('js/socket.io.js', function(){
	$.getScript('javascripts/game.js');
	socket=io();

	socket.on('gamestart', function(data){
		var overlay = jQuery('<div id="overlay">Starting Game id:'+data.id+'</div>');
		overlay.appendTo($('#mainComponent'));
		$('#mainComponent').bind('click', function(){
			$('#overlay').remove();
			$(this).unbind('click');
		});
	});
});