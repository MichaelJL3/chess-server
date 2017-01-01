$(document).ready(function(){
	$('.description').hide();

	$('.piece').hover(
		function(){
			$(this).stop().animate({right: '100%'}, 'slow');
		},
		function(){
			$(this).stop().animate({right: '0%'}, 'slow');
		}
	);

	$('.header').mouseover(function() {
        var feat=$(this).siblings('.description');
        feat.show();
		feat.stop().animate({top: 70}, 700);
	});

	$('.header').mouseleave(function() {
		var feat=$(this).siblings('.description');
		feat.stop().animate({top: -140}, 400, function(){
			feat.hide();
		});
	});

	$('.description').mouseover(function(event) {
    	event.preventDefault();
	});
});