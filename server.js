var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var app = express();
const PORT = 3000;

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var Operations = require("./database/Operations.js")();
var Models = require("./database/Models.js")(mongoose);
var colors = require("./staticData/colors.json").data;

var id_game = 1;
var during_game = [];
var ended_games = [];
const latency = 3;

mongoose.connect('mongodb://localhost/Chinczyk');
var db;

function connectToMongo() {
    db = mongoose.connection;
    db.on("error", function (err) {
        console.log("Mongo ma problem");
    });
    db.once("open", function () {
        console.log("Mongo jest podłączone i działa!");
        // Operations.DeleteAll(Models.Game);
        // Operations.DeleteAll(Models.Player);
    });
    db.once("close", function () {
        console.log("Mongo zostało zamknięte.");
    });
}

function changeQueue(inGame) {
    inGame.timeOfLastStartQueue = new Date();
    Operations.SelectPlayers(Models.Player, inGame._id, function (players) {
        var players = players.data;
        var previousPlayer;
        var temp_colors = [];
        for (var i = 0; i < colors.length; i++) {
            for(var j = 0; j < players.length; j++) {
                if (players[j].color == colors[i]) {
                    temp_colors.push(colors[i]);
                    if (players[j].status == 3) {
                        previousPlayer = players[j];
                    }
                }
            }
        }
        var colorIndex = temp_colors.indexOf(previousPlayer.color) + 1;
        if (colorIndex >= temp_colors.length) {
            colorIndex = 0;
        }
        var nextPlayerIndex = players.findIndex(function (player) {
            return player.color == temp_colors[colorIndex] && player.id_game == inGame._id;
        })

        Operations.UpdateStatusOfPlayer(Models.Player, inGame._id, previousPlayer.nick, 2, () => {
            Operations.UpdateStatusOfPlayer(Models.Player, inGame._id, players[nextPlayerIndex].nick, 3, () => {
                Operations.UpdateTimeOfLastStartQueue(Models.Game, inGame._id, new Date());
            });
        });
    })
}

function mainGamesInterval() {
    during_game.forEach(inGame => {
        var old_date = inGame.timeOfLastStartQueue;
        var new_date = new Date();
        var dates_diff = new_date - old_date;
        
        if (dates_diff/1000 >= 60 + latency) {
            changeQueue(inGame);
        }
    });
}

function checkIfGameEnded (id_game) {
    var indexOfGame = during_game.findIndex(function (x) { return x._id == id_game });
    
    if (indexOfGame != -1) {
        var board = during_game[indexOfGame].board;
        var redCount = 0, greenCount = 0, blueCount = 0, yellowCount = 0;

        for (var i = 0; i < board.length; i++) {
            if (board[i].absoluteField >= 40) {
                if (board[i].color == '#ff0000') redCount++;
                else if (board[i].color == '#00ff00') greenCount++;
                else if (board[i].color == '#0000ff') blueCount++;
                else if (board[i].color == '#ffff00') yellowCount++;
            }
        }

        if (redCount >= 4) return {
                            gameFinished: 1,
                            color: "red",
                            message: "Czerwony wygrał"
                        }
        else if (greenCount >= 4) return {
                            gameFinished: 1,
                            color: "green",
                            message: "Zielony wygrał"
                        }
        else if (blueCount >= 4) return {
                            gameFinished: 1,
                            color: "blue",
                            message: "Niebieski wygrał"
                        }
        else if (yellowCount >= 4) return {
                            gameFinished: 1,
                            color: "yellow",
                            message: "Żółty wygrał"
                        }
        else return {
                gameFinished: 0,
                color: "none",
                message: "Jeszcze nikt nie wygrał"
            }
    }
}

connectToMongo();
setInterval(mainGamesInterval, 1000);

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + "/src/index.html"));
})
.get('/js/ServerController.js', function (req, res) {
    res.sendFile(path.join(__dirname + "/src/js/ServerController.js"));
})
.get('/js/GameController.js', function (req, res) {
    res.sendFile(path.join(__dirname + "/src/js/GameController.js"));
})
.get('/js/VoiceController.js', function (req, res) {
    res.sendFile(path.join(__dirname + "/src/js/VoiceController.js"));
})
.get('/js/gameLogicProperties.js', function (req, res) {
    res.sendFile(path.join(__dirname + "/src/js/gameLogicProperties.js"));
})
.get('/styles/style.css', function (req, res) {
    res.sendFile(path.join(__dirname + "/src/styles/style.css"));
})
.get('/img/plansza.png', function (req, res) {
    res.sendFile(path.join(__dirname + "/src/img/plansza.png"));
})
.get('/img/kostka_1.png', function (req, res) {
    res.sendFile(path.join(__dirname + "/src/img/kostka_1.png"));
})
.get('/img/kostka_2.png', function (req, res) {
    res.sendFile(path.join(__dirname + "/src/img/kostka_2.png"));
})
.get('/img/kostka_3.png', function (req, res) {
    res.sendFile(path.join(__dirname + "/src/img/kostka_3.png"));
})
.get('/img/kostka_4.png', function (req, res) {
    res.sendFile(path.join(__dirname + "/src/img/kostka_4.png"));
})
.get('/img/kostka_5.png', function (req, res) {
    res.sendFile(path.join(__dirname + "/src/img/kostka_5.png"));
})
.get('/img/kostka_6.png', function (req, res) {
    res.sendFile(path.join(__dirname + "/src/img/kostka_6.png"));
})
.post("/sendNick",function(req,res) {
    var nick = req.body.nick;

    Operations.SelectAll(Models.Game, function (resGames) {
        let games = resGames.data;
        let availableGame;
        for (var i = 0; i < games.length; i++) {
            let game = games[i];
            if (game.statusOfGame == 0 && game.playerCounter < 4) {
                availableGame = game;
                break;
            }
        }
        
        if (availableGame != undefined) {
            Operations.UpdatePlayerCounter(Models.Game, availableGame._id, availableGame.playerCounter + 1);
        } else {
            var game = new Models.Game({
                playerCounter: 1,
                statusOfGame: 0
            });
            Operations.InsertOne(game);
            availableGame = game;
        }

        Operations.SelectPlayers(Models.Player, availableGame._id, function (players) {
            var temp_colors = Object.create(colors);
            players.data.forEach(el => {
                temp_colors.splice( temp_colors.indexOf(el.color), 1 );
            });

            var randomIndex = Math.floor(Math.random()*temp_colors.length); // <0; 3> całkowite

            var player = new Models.Player({
                nick: nick,
                insert_time: new Date(),
                last_activity: new Date(),
                status: 0,
                color: temp_colors[randomIndex],
                id_game: availableGame._id
            });

            Operations.InsertOne(player);

            players.data.push(player);
            players = players.data;

            res.send({
                message: "Utworzono nowego gracza",
                success: 1,
                players: players
            })
        })
    })
 })
.post("/askForChanges", function (req, res) {
    var id_game = req.body.id_game;
    Operations.SelectOneGame(Models.Game, id_game, function (game) {
        Operations.SelectPlayers(Models.Player, id_game, function (players) {
            if (game.data[0] != undefined) {
                var obj = {
                    game: game.data,
                    players: players.data,
                    gameStarted: false
                }

                let statusOfAllPlayers = 1;
                players.data.forEach(player => {
                    if (player.status == 0) {
                        statusOfAllPlayers = 0;
                    }
                });

                if (game.data[0].playerCounter >= 2 && statusOfAllPlayers == 1) {
                    // Rozpoczecie rozgrywki
                    obj.gameStarted = true;

                    obj.players.forEach(player => {
                        player.status = 2;
                    });

                    Operations.UpdateStatusOfPlayers(Models.Player, id_game, 2, function () {
                        var temp_colors = Object.create(colors);
                        var whichPlayerStarts;
                        for (var j = 0; j < temp_colors.length; j++) {
                            for (var i = 0; i < players.data.length; i++) {
                                if (players.data[i].color == temp_colors[j]) {
                                    whichPlayerStarts = players.data[i]._id;
                                    obj.players[i].status = 3;
                                    Operations.UpdateStatusOfPlayer(Models.Player, id_game, players.data[i].nick, 3, () => {});
                                    break;
                                }
                            }
                            if (whichPlayerStarts != undefined) break;
                        }
                        obj.whichPlayerStarts = whichPlayerStarts;
                        var date = new Date();

                        var check = true;
                        during_game.forEach(inGame => {
                            if (inGame._id == id_game) {
                                check = false;
                            }
                        });
                        if (check == true) {
                            obj.game[0].timeOfLastStartQueue = date;
                            obj.game[0].board = [];
                            during_game.push(obj.game[0]);
                            Operations.UpdateStatusOfGame(Models.Game, id_game, 1);
                            Operations.UpdateBoard(Models.Game, id_game, new Array());
                            Operations.UpdateTimeOfLastStartQueue(Models.Game, id_game, date);
                        }

                        res.send(obj);
                    });

                } else {
                    res.send(obj);
                }
            }
        })
    })
 })
.post("/changeStatus", function (req, res) {
    var id_game = req.body.id_game;
    var nick = req.body.nick;
    var status = req.body.status;

    Operations.UpdateStatusOfPlayer(Models.Player, id_game, nick, status, () => {});

    res.send({ success: 1 });
})
.post("/askForQueue", function (req, res) {
    var id_game = req.body.id_game;
    var indexOfEndedGame = ended_games.findIndex((x) => { return x.id_game == id_game});

    if (indexOfEndedGame != -1) {
        res.send(ended_games[indexOfEndedGame]);
    } else {
        Operations.SelectOneGame(Models.Game, id_game, function (game) {
            Operations.SelectPlayers(Models.Player, id_game, function (players) {
                var obj = {
                    gameFinished: 0,
                    game: game,
                    players: players
                };

                res.send(obj);
            });
        });
    }
})
.post("/randomNumber", function (req, res) {
    var id_game = req.body.id_game;
    var id_player = req.body.id_player;

    Operations.SelectPlayers(Models.Player, id_game, function (players) {
        var players = players.data;
        players.forEach(player => {
            if (player._id == id_player && player.status == 3) {
                var random_number = Math.floor((Math.random() * 6) + 1);
                var indexOfGame = during_game.findIndex(function (x) { return x._id == id_game });
                during_game[indexOfGame].random = random_number;
                res.send({ message: "Rzuciłeś kostką", random: random_number});

            } else if (player._id == id_player && player.status != 3) {
                res.send({ message: "Nie masz możliwości rzucania kostką!", random: 0 });
            }
        });
    })
})
.post("/clientDecision", function (req, res) {
    var id_game = req.body.id_game;
    var id_player = req.body.id_player;
    var id_pawn = req.body.id_pawn;
    var absoluteField = req.body.absoluteField;
    var field = req.body.field;
    var to_remove = req.body.to_remove;

    var indexOfGame = during_game.findIndex(function (x) { return x._id == id_game });

    if (during_game[indexOfGame] != undefined) {

        Operations.SelectPlayers(Models.Player, id_game, function (players) {
            var players = players.data;
            var colorOfPlayer = players[players.findIndex((x) => { return x._id == id_player })].color;

            var gotRandom = during_game[indexOfGame].random;

            if (field == "no_decision") {
                changeQueue(during_game[indexOfGame]);
                res.send("No decision made in game");
            } else {
                to_remove.forEach(pawnId => {
                    var indexOfPawn = during_game[indexOfGame].board.findIndex((x) => { return x.id_pawn == pawnId });
                    during_game[indexOfGame].board.splice(indexOfPawn, 1);
                });

                if (field == 0) {
                    during_game[indexOfGame].board.push({
                        id_pawn: id_pawn,
                        color: colorOfPlayer,
                        field: field,
                        absoluteField: absoluteField
                    });
                } else {
                    var board = during_game[indexOfGame].board;
                    var indexOfPawn = board.findIndex((x) => { return x.id_pawn == id_pawn});
                    board[indexOfPawn].field = field;
                    board[indexOfPawn].absoluteField = absoluteField;
                }

                var gameEndedMessage = checkIfGameEnded(id_game)

                if (gameEndedMessage.gameFinished == 1) {
                    var obj = {
                        id_game: id_game,
                        color: gameEndedMessage.color,
                        message: gameEndedMessage.message,
                        gameFinished: 1
                    }

                    ended_games.push(obj);
                    Operations.DeleteById(Models.Game, id_game);
                    Operations.DeletePlayersByIdGame(Models.Player, id_game);
                    res.send(obj)
                } else {
                    changeQueue(during_game[indexOfGame]);
                    Operations.UpdateBoard(Models.Game, id_game, during_game[indexOfGame].board);
                    res.send("Scene updated")
                }
            }
        });
    } else {
        res.send("Game not available");
    }
});

app.listen(PORT, function () { 
    console.log(" === Serwer zostaje uruchomiony na porcie " + PORT + ".");
})