
var Timer = function(game, time, relTime){
	var game=game;
	var time=time;
	var timeObj=relTime;
	var timefn;

	var parseTime = function(seconds){
		var timeObj={
			min: (seconds/60) | 0,
			sec: (seconds%60) | 0
		};

		return timeObj;
	};

	var clear = function(){
		clearInterval(this.timefn);
	}
};

Timer.prototype.setGame = function(game){
	this.game=game;
};

Timer.prototype.setMoveTime = function(time){
	this.time=time;
};

Timer.prototype.setLastTime = function(timeObj){
	this.timeObj=timeObj;
};

Timer.prototype.startTimer = function(){
	var now = Date.parse(new Date());
	var end;

	if(this.timeObj){
		end = (now-this.timeObj)%this.time;
	}else
		end = now+this.time;
	
	this.timefn=setInterval(this.setTimer.bind(this, end), 1000);
};

Timer.prototype.endTimer = function(){
	clearInterval(this.timefn);
	$('#clock').html('N/A');
};

Timer.prototype.setTimer = function(end){
	var total = (end-Date.parse(new Date()))/1000;
	var timeObj = this.parseTime(total);

	$('#clock').html(
		'minutes: '+timeObj.min+
		' seconds: '+timeObj.sec);

	if(total<=0){
		clearInterval(this.timefn);
		window.location.replace("");
	}
};