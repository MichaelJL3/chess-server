
var types={
	rook: "glyphicon-tower",
	knight: "glyphicon-knight",
	bishop: "glyphicon-bishop",
	queen: "glyphicon-queen",
	king: "glyphicon-king",
	pawn: "glyphicon-pawn"
};

function pieceType(piece){
	var name=piece.getAttribute('class');
	if(name)
		return types[(name.split(' ')[0])];
}

function playerColor(obj){
	return $(obj).text().trim();
}

function newCol(piece, style){
	var col=$('<td></td>');
	var className=pieceType(piece);

	if(className)
		$(piece).addClass(className);

	$(col).append(piece);
	$(col).addClass(style);
	return col;
}

function processBoards(){
	var boards=$('.board');
	var icos=$('ico');
	var size=boards.length;

	for(var i=0; i<size; i++){
		if(playerColor(icos[i])==='white')
			styleBoardUpsideDown(boards[i]);
		else
			styleBoard(boards[i]);
	}
}

function styleBoard(board){
	var pieces=$(board).find('piece');
	var size=pieces.length;
	var table=$('<table></table>');
	var first="blackTile";
	var second="whiteTile";
	var temp;
	var row;

	//if(size!==64)
	$(board).append(table);

	for(var i=0; i<size; i+=2){
		if(!(i%8)){
			row=$('<tr></tr>');
			$(table).append(row);
			temp=first;
			first=second;
			second=temp;
		}
		$(row).append(newCol(pieces[i], first));
		$(row).append(newCol(pieces[i+1], second));
	}
}

function styleBoardUpsideDown(board){
	var pieces=$(board).find('piece');
	var size=pieces.length;
	var table=$('<table></table>');
	var first="blackTile";
	var second="whiteTile";
	var temp;
	var row;

	//if(size!==64)
	$(board).append(table);

	for(var i=size-1; i>0; i-=2){
		if(!((i+1)%8)){
			row=$('<tr></tr>');
			$(table).append(row);
			temp=first;
			first=second;
			second=temp;
		}
		$(row).append(newCol(pieces[i], first));
		$(row).append(newCol(pieces[i-1], second));
	}
}

$(document).ready(function(){
	$('.pbody').toggle();

	$('.features').mouseenter(function() {
		var pbody=$(this).find('.pbody');

        $(this).filter(':not(:animated)').find('.sliders').animate({right: '100%', width: '200%'}, 'slow', function(){
        	$(pbody).filter(':not(:animated)').animate({right: '100%', width: '100%'}, 'fast', function(){
	        	$(pbody).filter(':not(:animated)').slideDown('slow');
	        });
        });
	});

	$('.features').mouseleave(function() {
		var slide=$(this).find('.sliders');

		$(this).stop(true).find('.pbody').slideUp('slow', function(){
			$(this).stop(true).animate({right: '0%', width: '0%'}, 'fast', function(){
				$(slide).stop(true).animate({right: '0%', width: '100%'}, 'slow');
			});
		});
	});
});