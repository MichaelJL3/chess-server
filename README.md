
# Name

The Iron Throne 

## Overview

The Iron Throne is a web app that allows users to play chess together, giving the users the ability to keep up to 5 games, resign from games, create games, filter games for their play styles. The app will require a user account to be created. 

Considerations for the app if time permits would be to add in some additional options, in game messaging

(^ still want to add that in should be quick but dont have the time)

## Data Model

Minimally a storage for Users and Games

* Users can have multiple games up to a set MAX

* Each game keeps a state of the board and keeps an expiration
 which will remove the entry from database after a week

schema:

```javascript
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
```

/sitemap - shows basic xml layout of pages and connectivity describes only basic flow not absolute (check sitemap.png)

The Game works as follows a user registers/signs in

then creates a game with a choice of defined time limits per move and piece color

a player can create multiple games but there is a cap

a player can play multiple games switching between but note the timers are still keeping track and switching the board

a player can forfeit a game which will send a message to the other player and delete the game from the database

a player can search for a game based on move times and colors

whenever a move is made socket io calls synch the moves to be displayed by both players then saves the state of the game and switches users

The game currently doesnt support castling, stalemate rules, check, checkmate
the player loses when the king is physically removed from the board

(^still working on improving these)

The server is acting as a time synchronizer and has a semi backup system upon crashing to resume games without too much of a time discrepency