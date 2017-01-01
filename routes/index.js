var express = require('express');
var mongoose = require('mongoose');
var Board = mongoose.model('Board');
var User = mongoose.model('User');
var passport = require('passport');

var router = express.Router();

function setupNewBoard(board){
    var i=0;
    var pawn=0;

    board[0]="rook white pos-l";
    board[1]="knight white pos-l";
    board[2]="bishop white pos-l";
    board[3]="king white pos-c";
    board[4]="queen white pos-c";
    board[5]="bishop white pos-r";
    board[6]="knight white pos-r";
    board[7]="rook white pos-r";

    board[56]="rook black pos-r";
    board[57]="knight black pos-r";
    board[58]="bishop black pos-r";
    board[59]="queen black pos-c";
    board[60]="king black pos-c";
    board[61]="bishop black pos-l";
    board[62]="knight black pos-l";
    board[63]="rook black pos-l";

    for(i=8; i<16; i++)
        board[i]="pawn white pos-"+(++pawn);

    for(; i<48; i++)
        board[i]=undefined;

    pawn=0;
    for(; i<56; i++)
        board[i]="pawn black pos-"+(++pawn);
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect('home'); 
});

/* GET home page */
router.get('/home', function(req, res){
    var user=(req.user?req.user.username:undefined);
    res.render('homepage', {title: 'home', username: user});
});

/* GET about page */
router.get('/about', function(req, res){
    var user=(req.user?req.user.username:undefined);
    res.render('about', {title: 'about', username: user});
});

router.post('/newgame', function(req, res){
    var user=req.body['user'];

    if(!req.user||req.user.username!==user){
        res.redirect('/error');
        return;
    }

    var board=[];
    var time=req.body['time'];
    var color=req.body['color'];

    setupNewBoard(board);

    //setup a new board object
    var newGame = new Board({board: board});

    if(time)
        newGame.timed=time;
    if(color==='black')
        newGame.black=req.user._id;
    else
        newGame.white=req.user._id;

    //save the board into the database
    newGame.save(function(err, savedGame, count){
	    if(err){
	        console.log(err.errors);
        }
        if(savedGame){
            req.user.numGames++;
            req.user.games.push(savedGame._id);
            req.user.save(function(err){
                if(err){
                    console.log(err.errors);
                }
            });

            res.send(savedGame._id);
        }
	});
});

router.post('/join', function(req, res){
    var user=req.body['user'];
    var join={relTime: Date.parse(new Date())};

    if(!req.user||user!==req.user.username){
        res.redirect('/error');
        return;
    }

    var id=req.body["id"];
    var color=req.body["color"];

    if(color==='black')
        join.black = req.user._id;
    else
        join.white = req.user._id;

    Board.update({ _id: id }, {$set: join}, function(err){
        if(err)
            console.log(err.errors);
        else{
            req.user.numGames++;
            req.user.games.push(id);
            req.user.save(function(err){
                if(err){
                    console.log(err.errors);
                }
            });
        }

        res.send('success');
    });
});

router.post('/getTime', function(req, res){
    var id=req.body["id"];

    if(!req.user){
        res.redirect('/error');
        return;
    }

    Board.findOne({ _id: id}, function(err, board){
        if(err)
            console.log(err.errors);

        if(board)
            res.send({time: board.relTime});
    });
});

router.post('/saveMove', function(req, res){
    var id=req.body["id"];
    var board=req.body["board[]"];
    var turn=req.body["turn"];

    if(!req.user){
        res.redirect('/error');
        return;
    }

    Board.findOneAndUpdate({ _id: id }, 
        {$set: {board:board, turn:turn, relTime: Date.parse(new Date())}}, 
        function(err){
        if(err)
            console.log(err.errors);

        res.send('success');
    });
});

router.post('/removeId', function(req, res){
    var id=req.body["id"];
    var index;

    if(!req.user){
        res.redirect('/error');
        return;
    }

    if(id){
        req.user.numGames--;
        index = req.user.games.indexOf(id);
        req.user.games.splice(index, 1);

        req.user.save(function(err){
            if(err){
                console.log(err.errors);
            }
        });
    }

    res.send('success');
});

router.post('/delGame', function(req, res){
    var id=req.body["id"];

    if(!req.user){
        res.redirect('/error');
        return;
    }

    var user=req.user._id;

    Board.findByIdAndRemove(id, function(err, board){
        if(err)
            console.log(err.errors);

        if(board){
            if(board.black===user)
                user=board.white;
            else
                user=board.black;

            if(user){
                User.findOneAndUpdate(
                    {_id: user}, 
                    {$pull: {games: id},
                     $inc: {numGames: -1}},
                    function(err, res){
                        if(err)
                            console.log(err.errors);
                    }
                );
            }

            res.redirect(307, '/removeId');
        }
    });
});

router.post('/game', function(req, res){
    var user=req.body["user"];

    if(!req.user||user!==req.user.username){
        res.redirect('/error');
        return;
    }

    var userId=req.user._id;
    var id=req.body["id"];

    var search={$or: [
        {black: userId}, {white: userId}
    ]};

    search._id=id;

    Board.findOne(search, function(err, findGame){
        if(err){
            console.log(err.errors);
            err=err.errors;
        }

        if(findGame){
            if(findGame.black&&findGame.white)
                findGame.active=true;
            if(findGame.black&&findGame.black.toString()==req.user._id.toString())
                findGame.player='black';
            else
                findGame.player='white';
        }

        res.render('game', {
            layout: false,
            game: findGame,
            error: err,
            _id: id
        });
    });
});

router.post('/usersgames', function(req, res){
    var user=req.body['user'];

    if(!req.user||user!==req.user.username){
        res.redirect('/error');
        return;
    }
    
    User.findOne({username: user}).populate('games').exec(function(err, getGames){
        if(err){
            console.log(err.errors);
            err=err.errors;
        }

        if(getGames){
            getGames=getGames.games;
            var size=getGames.length;
            var game;

            for(var i=0; i<size; i++){
                game=getGames[i];
                if(game.black&&game.white)
                    game.active=true;
                if(game.black&&game.black.toString()==req.user._id.toString())
                    game.player='black';
                else
                    game.player='white';
                game.timed=Math.floor(getGames[i].timed/60);
            }
        }

        res.render('usersgames', {
            layout: false,
            username: user,
            board: getGames, 
            error: err
        });
    });
});

router.post('/findgames', function(req, res){
    var user=req.body["user"];

    if(!req.user||user!==req.user.username){
        res.redirect('/error');
        return;
    }

    var time=req.body['time'];
    var color=req.body['color'];

    var search={black: {$ne: req.user._id}, white: {$ne: req.user._id}};

    if(time)
        search.timed=time;
    if(color==="black")
        search.black={$exists: false};
    else if(color==="white")
        search.white={$exists: false};

    Board.find(search, function(err, findGames){
        if(err){
            console.log(err.errors);
            err=err.errors;
        }

        res.render('findgames', {
            layout: false,
            username: user,
            board: findGames, 
            error: err
        });
    });
});

/* GET login page */
router.get('/login', function(req, res, next){
  var user=(req.user?req.user.username:undefined);
  res.render('login', {title: 'Login', username: user});
});

/* POST attempt to login */
router.post('/login', function(req, res, next){
  passport.authenticate('local', function(err,user) {
    //any errors render the login page again
    if(err){
      console.log(err);
      res.render('login', {title: 'Login', error: err});
    }
  
    else if(user) {
      req.logIn(user, function(err) {
        if(err){
          console.log(err);
          res.render('login', {title: 'Login', error: err});
        }
        //if no error occurs take to the users home page
        else{
          res.redirect('/'+user.username);
        }
      });
    } 

    else{
      err=["Failed to login", "Incorrect username or password"]; 
      res.render('login', {title: 'Login', error: err});
    }
    
  })(req, res, next);
});

/* GET register page */
router.get('/register', function(req, res, next){
  var user=(req.user?req.user.username:undefined);
  res.render('register', {title: 'Register', username: user});
});

/* POST attempt to register */
router.post('/register', function(req, res, next){
  //register new user
  User.register(new User({username:req.body.username}), 
    req.body.password, function(err, user){
      if (err) {
        //bring back to register if failed
        console.log(err);
        res.render('register', {title: 'Register', error: err});
        return;
      } 
      
      //automaticallty authenticate if successful and route to users page
      passport.authenticate('local')(req, res, function() {
        res.redirect(req.user.username);
      });
  }); 
});

/* GET lougout page */
router.get('/logout', function(req, res, next){
  //take back to login page when done
  req.logout();
  res.redirect('/login');
});

router.get('/error', function(req, res){
    res.render('error', {layout: false, error: {status: 404}, message: 'error loading page'});
});

/* ANY other page is checked as a user page */
router.get('/:user', function(req, res){
    var user=req.params.user;

    if(!req.user||user!==req.user.username)
        res.redirect('/login');
    else
        res.render('display', {username: user});
});

module.exports = router;
