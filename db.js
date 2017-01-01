var mongoose=require('mongoose');
var passportmongoose=require("passport-local-mongoose");


if (process.env.NODE_ENV == 'PRODUCTION') {
	var fs = require('fs');
	var path = require('path');
	var fn = path.join(__dirname, 'config.json');
	var data = fs.readFileSync(fn);

	var conf = JSON.parse(data);
	var dbconf = conf.dbconf;
} else {
 	dbconf = 'mongodb://127.0.0.1/final';
}

var Board = new mongoose.Schema({
    board: [String],
    turn: {type: String, enum: ['white', 'black'], default: 'white'},
    createdAt: {type: Date, expires: 604800, default: Date.now},
    black: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    white: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    timed: {type: Number, default: 300},
    relTime: {type: Number}
});

Board.path('board').validate(function(val){
    return (val.length===64);
},"Game Data Corrupted");

var User = new mongoose.Schema({
    games: [{type: mongoose.Schema.Types.ObjectId, ref: 'Board'}],
    numGames: {type: Number, min: 0, max: 5, default: 0}
});

User.plugin(passportmongoose);

mongoose.model('Board', Board);
mongoose.model('User', User);

//mongoose.Promise = global.Promise;

//connect to database
mongoose.connect(dbconf);
