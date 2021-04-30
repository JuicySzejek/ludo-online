const latency = 3;

class GameController {
    constructor (nick, players) {
        this.myPlayer = {
            nick: nick,
            color: undefined
        }
        this.queue = {
            nick: undefined,
            startTime: undefined,
            diceNumber: undefined
        };
        this.array_colorsNames = ["red", "blue", "yellow", "green"];
        this.intervalTimeOfPlayer = setInterval(() => {}, 10000);
        this.intervalBlinking = setInterval(() => {}, 10000);

        document.getElementsByTagName("body")[0].innerHTML = "";
        this.playersData = players;
        this.id_game = players[0].id_game;

        for (var i = 0; i < 4; i++) {
            var div = document.createElement("div");
            div.classList.add("divNick");
            if (players[i] != undefined) {
                if (players[i].nick == this.myPlayer.nick) {
                    this.myPlayer.color = players[i].color;
                    if (this.myPlayer.color == "#ff0000") this.myColor = this.array_colorsNames[0];
                    else if (this.myPlayer.color == "#0000ff") this.myColor = this.array_colorsNames[1];
                    else if (this.myPlayer.color == "#ffff00") this.myColor = this.array_colorsNames[2];
                    else if (this.myPlayer.color == "#00ff00") this.myColor = this.array_colorsNames[3];
                    setFields(this.myPlayer.color);
                }
                div.innerHTML = players[i].nick;
                if (players[i].status == 0) {
                    div.style.backgroundColor = "#444";
                } else {
                    div.style.backgroundColor = players[i].color;
                }

                if (players[i].nick == this.myPlayer.nick) {
                    div.style.color = "#79c519";
                }
            } else {
                div.innerHTML = "?";
                div.style.backgroundColor = "#bbb";
            }

            document.getElementsByTagName("body")[0].appendChild(div);
        }

        this.addSlider();

        this.interval = setInterval(() => {
            serverController.askForChanges(this.id_game);
        }, 3000);
    }

    changeColorsOfPlayers = () => {
        for (var i = 0; i < this.playersData.length; i++) {
            var div = document.getElementsByClassName("divNick")[i];
            if (this.playersData[i].status == 0) {
                div.style.backgroundColor = "#444";
            } else {
                div.style.backgroundColor = this.playersData[i].color;
            }
        }
    }

    addSlider = () => {
        var label = document.createElement("label");
        label.classList.add("switch");
        var input = document.createElement("input");
        input.setAttribute("type", "checkbox");

        input.addEventListener("change", () => {
            if (input.checked == true) {
                serverController.changeStatus(this.id_game, this.myPlayer.nick, 1);
                this.playersData[this.playersData.findIndex((x) => { return x.nick == this.myPlayer.nick; })].status = 1;
            } else {
                serverController.changeStatus(this.id_game, this.myPlayer.nick, 0);
                this.playersData[this.playersData.findIndex((x) => { return x.nick == this.myPlayer.nick; })].status = 0;
            }
            this.changeColorsOfPlayers();
        })

        var span = document.createElement("span");
        span.classList.add("slider");
        span.classList.add("round");

        label.appendChild(input);
        label.appendChild(span);
        document.getElementsByTagName("body")[0].appendChild(label);
    }

    movePawn = (e) => {
        var isDecided = false;
        var pawn = e.target;
        var playersDots = document.getElementsByClassName(this.myColor);
        var clickingPlayer = (this.playersData[this.playersData.findIndex((x) => { return x.nick == this.myPlayer.nick })]);
        if (pawn.getAttribute("data-field") == null) {
            if ((this.queue.diceNumber == 1 || this.queue.diceNumber == 6) && pawn.getAttribute("data-field") == undefined) {
                pawn.setAttribute("data-field", "0");
                var indexOfField = plansza.findIndex((x) => { return x.field == 0 });
                var field = plansza[indexOfField];
                var absoluteField = field.absoluteField;
                pawn.style.left = "" + field.pos_x + "px";
                pawn.style.top = "" + field.pos_y + "px";

                var pawns = document.getElementsByClassName("pion");
                var to_remove = [];

                for (var i = 0; i < pawns.length; i++) {
                    var other_pawn = pawns[i];
                    var color_of_other_pawn = other_pawn.classList[1];

                    if (color_of_other_pawn != this.myColor && other_pawn.getAttribute("data-field") == 0
                        && other_pawn.getAttribute("data-field") <= 39) {
                        other_pawn.style.left = other_pawn.getAttribute("data-back-position-x");
                        other_pawn.style.top = other_pawn.getAttribute("data-back-position-y");
                        other_pawn.setAttribute("data-field", null);

                        to_remove.push(other_pawn.id);
                    }
                }

                isDecided = true;
                var obj = {
                    id_game: this.id_game,
                    id_player: clickingPlayer._id,
                    id_pawn: pawn.getAttribute("id"),
                    field: field.field,
                    absoluteField: absoluteField,
                    to_remove: to_remove
                }
                serverController.clientDecision(obj);
            } else {
                isDecided = true;
                var obj = {
                    id_game: this.id_game,
                    id_player: clickingPlayer._id,
                    id_pawn: pawn.getAttribute("id"),
                    field: "no_decision",
                    absoluteField: "no_decision"
                }
                serverController.clientDecision(obj);
            }
        } else if (parseInt(pawn.getAttribute("data-field")) + this.queue.diceNumber < 44) {
            var where = parseInt(pawn.getAttribute("data-field"));
            where += this.queue.diceNumber;
            var noPossibility = false;
            if (where >= 40) {
                var pawns_withColor = document.getElementsByClassName(this.myColor);

                for (var i = 0; i < pawns_withColor.length; i++) {
                    var dataField = pawns_withColor[i].getAttribute("data-field");
                    if (parseInt(dataField) == where) noPossibility = true;
                }
            }
            if (noPossibility == false) {
                pawn.setAttribute("data-field", ""+where);
                var field = plansza.findIndex((x) => {
                    if (x.absoluteField >= 40) {
                        return (x.field == where && x.player == this.myColor)
                    } else {
                        return (x.field == where)
                    }
                });
                var absoluteField = plansza[field].absoluteField;
                pawn.style.left = plansza[field].pos_x + "px";
                pawn.style.top = plansza[field].pos_y + "px";
                isDecided = true;
                
                var pawns = document.getElementsByClassName("pion");
                var to_remove = [];

                for (var i = 0; i < pawns.length; i++) {
                    var other_pawn = pawns[i];
                    var color_of_other_pawn = other_pawn.classList[1];

                    if (color_of_other_pawn != this.myColor && other_pawn.getAttribute("data-field") == where
                        && other_pawn.getAttribute("data-field") <= 39) {
                        other_pawn.style.left = other_pawn.getAttribute("data-back-position-x");
                        other_pawn.style.top = other_pawn.getAttribute("data-back-position-y");
                        other_pawn.removeAttribute("data-field");

                        to_remove.push(other_pawn.id);
                    }
                }

                var obj = {
                    id_game: this.id_game,
                    id_player: clickingPlayer._id,
                    id_pawn: pawn.getAttribute("id"),
                    field: where,
                    absoluteField: absoluteField,
                    to_remove: to_remove
                }
                serverController.clientDecision(obj);

            } else {
                isDecided = true;
                var obj = {
                    id_game: this.id_game,
                    id_player: clickingPlayer._id,
                    id_pawn: pawn.getAttribute("id"),
                    field: "no_decision",
                    absoluteField: "no_decision"
                }
                serverController.clientDecision(obj);
            }
        } else {
            isDecided = true;
            var obj = {
                id_game: this.id_game,
                id_player: clickingPlayer._id,
                id_pawn: pawn.getAttribute("id"),
                field: "no_decision",
                absoluteField: "no_decision"
            }
            serverController.clientDecision(obj);
        }

        if (isDecided == true) {
            clearInterval(this.intervalBlinking);
            this.intervalBlinking = null;
            for (let i = 0; i < playersDots.length; i++) {
                var dot = playersDots[i];
                dot.style.cursor = "initial";
                dot.style.backgroundColor = this.myPlayer.color;
                dot.removeEventListener("click", this.movePawn);
            }
        }
    }

    changesInPlayers = (data) => {
        var data = JSON.parse(data);
        this.playersData = data.players;
        for (var i = 0; i < this.playersData.length; i++) {
            var div = document.getElementsByClassName("divNick")[i];

            div.innerHTML = this.playersData[i].nick;
            if (this.playersData[i].status == 0) {
                div.style.backgroundColor = "#444";
            } else {
                div.style.backgroundColor = this.playersData[i].color;
            }
        }
        if (data.gameStarted == true) {
            // Gra rozpoczyna się
            clearInterval(this.interval);

            this.interval = setInterval(() => {
                serverController.askForQueue(this.id_game);
            }, 3000);

            document.getElementsByClassName("slider")[0].remove();

            var img = document.createElement("img");
            img.classList.add("plansza");
            img.setAttribute("src","img/plansza.png");
            img.setAttribute("alt","Plansza");

            document.getElementsByTagName("body")[0].appendChild(img);
    
            for (var j = 0; j < 4; j++) {
                for (var i = 0; i < 4; i++) {
                    var pion = document.createElement("div");
                    var back_pos_x = (39+(626*(j % 2))+70*(i % 2))+"px";
                    var back_pos_y = (82+(626*Math.floor(j/2))+70*Math.floor(i/2))+"px";
                    pion.classList.add("pion");
                    pion.classList.add(this.array_colorsNames[j]);
                    pion.setAttribute("id", "pion_" + this.array_colorsNames[j] + "_" + i)

                    pion.setAttribute("data-back-position-x", back_pos_x);
                    pion.setAttribute("data-back-position-y", back_pos_y);
                    pion.style.position = "absolute";
                    pion.style.left = back_pos_x;
                    pion.style.top = back_pos_y;
        
                    document.getElementsByTagName("body")[0].appendChild(pion);
                }
            }
        }
    }

    changesInQueue = (data) => {
        var data = JSON.parse(data);

        if (data.gameFinished != 1) {
            var board = data.game.data[0].board;

            var pawns = document.getElementsByClassName("pion");
            for (var i = 0; i < pawns.length; i++) {
                var other_pawn = pawns[i];
                if (other_pawn.getAttribute("data-field") != undefined) {
                    var other_pawn_id = other_pawn.id;
                    var index_of_other_pawn = board.findIndex((x) => { return x.id_pawn == other_pawn.id});

                    if (index_of_other_pawn == -1) {
                        other_pawn.style.left = other_pawn.getAttribute("data-back-position-x");
                        other_pawn.style.top = other_pawn.getAttribute("data-back-position-y");
                        other_pawn.removeAttribute("data-field");
                    }
                }
            }

            board.forEach(pawn => {
                var id_pawn = pawn.id_pawn;
                var hexColor = pawn.color;
                var nameColor;
                if (hexColor == "#ff0000") nameColor = this.array_colorsNames[0];
                else if (hexColor == "#0000ff") nameColor = this.array_colorsNames[1];
                else if (hexColor == "#ffff00") nameColor = this.array_colorsNames[2];
                else if (hexColor == "#00ff00") nameColor = this.array_colorsNames[3];

                var indexOfField = plansza.findIndex((x) => { 
                    if (x.absoluteField >= 40) {
                        return (x.absoluteField == pawn.absoluteField && x.player == nameColor )
                    } else {
                        return (x.absoluteField == pawn.absoluteField )
                    }
                });
                var pos_x = plansza[indexOfField].pos_x;
                var pos_y = plansza[indexOfField].pos_y;
                var field = plansza[indexOfField].field;

                var elementHTML = document.getElementById(id_pawn);

                elementHTML.setAttribute("data-field", field);
                elementHTML.style.left = pos_x + "px";
                elementHTML.style.top = pos_y + "px";            
            });

            this.playersData = data.players.data;

            this.playersData.forEach(player => {
                var array_colorsHex = {"#ff0000": "czerwony", "#0000ff": "niebieski", "#00ff00":"zielony", "#ffff00":"żółty"};

                if (player.status == 3 && player.nick != this.queue.nick) {
                    var playersDots = document.getElementsByClassName(this.myColor);
                    for (let i = 0; i < playersDots.length; i++) {
                        var dot = playersDots[i];
                        dot.removeEventListener("click", this.movePawn);
                    }

                    clearInterval(this.intervalTimeOfPlayer);
                    this.queue.nick = player.nick;
                    this.queue.startTime = new Date(data.game.data[0].timeOfLastStartQueue);

                    if (document.getElementById("queueColor") != null)
                        document.getElementById("queueColor").remove();

                    var div = document.createElement("div");
                    div.setAttribute("id", "queueColor");
                    div.style.display = "inline-block";
                    div.innerHTML = "Kolej na gracza <span style='color:"+player.color+"; font-weight:bold;'>"+array_colorsHex[player.color]+"</span>";

                    document.getElementsByTagName("body")[0].insertBefore(div, document.getElementsByClassName("plansza")[0]);

                    this.intervalTimeOfPlayer = setInterval(() => {
                        var tempDate = new Date().getTime();
                        var leftTime = Math.floor(((60+latency)*1000-(tempDate-this.queue.startTime.getTime())) / 1000);

                        if (leftTime < 0) {
                            leftTime = 0;
                            if (document.getElementById("randomNumberButton") != null)
                                document.getElementById("randomNumberButton").remove();
                            if (this.intervalBlinking != null) {
                                var playersDots = document.getElementsByClassName(this.myColor);

                                for (let i = 0; i < playersDots.length; i++) {
                                    var dot = playersDots[i];
                                    dot.style.cursor = "initial";
                                    dot.style.backgroundColor = this.myPlayer.color;
                                    dot.removeEventListener("click", this.movePawn);
                                }

                                clearInterval(this.intervalBlinking);
                                this.intervalBlinking = null;
                            }
                        }

                        if (div != null) {
                            div.innerHTML = "Kolej na gracza <span style='color:"+player.color+"; font-weight:bold;'>"+array_colorsHex[player.color]+"</span> (" + leftTime + ")";


                        }
                    }, 1000);

                    setTimeout(() => {
                        if (this.myPlayer.nick == player.nick) {
                            if (document.getElementById("randomNumberButton") != null)
                                document.getElementById("randomNumberButton").remove();
        
                            var button = document.createElement("button");
                            button.setAttribute("id", "randomNumberButton");
                            button.value = "Rzut kostką";
                            button.innerHTML = "Rzut kostką";
                        
                            button.addEventListener("click", () => {
                                document.getElementById("randomNumberButton").remove();
        
                                var clickingPlayer = (this.playersData[this.playersData.findIndex((x) => { return x.nick == this.myPlayer.nick })]);
        
                                serverController.randomNumber(this.id_game, clickingPlayer._id);
                            })
        
                            document.getElementsByTagName("body")[0].insertBefore(button, document.getElementsByClassName("plansza")[0]);
                        }
                    }, 1000)
                }
            });
        } else {
            var pawns = document.getElementsByClassName(data.color);

            for (var i = 0; i < pawns.length; i++) {
                var indexOnBoard = plansza.findIndex((x) => { return x.player == data.color && x.field == 40+i });
                var pos_x = plansza[indexOnBoard].pos_x;
                var pos_y = plansza[indexOnBoard].pos_y;

                pawns[i].style.left = pos_x + "px";
                pawns[i].style.top = pos_y + "px";
            }

            alert("Gra zakończona. " + data.message);
            window.location.reload(true);
        }
    }

    decision = (data) => {
        data = JSON.parse(data);
        this.queue.diceNumber = data.random;
        var img = document.createElement("img");
        img.setAttribute("src", '/img/kostka_'+data.random+'.png');
        img.style.position = "absolute";
        img.style.top = "400px";
        img.style.left = "900px";

        voiceController.speak(data.random);

        document.getElementsByTagName("body")[0].appendChild(img);

        var temp_color = "#eee";
        var playersDots = document.getElementsByClassName(this.myColor);

        for (let i = 0; i < playersDots.length; i++) {
            var dot = playersDots[i];
            dot.addEventListener("click", this.movePawn);
        }

        this.intervalBlinking = setInterval(() => {
            for (let i = 0; i < playersDots.length; i++) {
                var dot = playersDots[i];
                dot.style.cursor = "pointer";

                if (dot.style.backgroundColor != "rgb(238, 238, 238)")
                    dot.style.backgroundColor = temp_color;
                else dot.style.backgroundColor = this.myPlayer.color;
            }
        }, 1000);
    }
}