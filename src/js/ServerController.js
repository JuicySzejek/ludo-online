class ServerController {

  constructor () {}

  sendNick = function (nick) {
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function(res) {
        if (this.readyState == 4 && this.status == 200) {
          var data = JSON.parse(res.target.response);
          gameController = new GameController(nick, data.players);
        }
      };
      xhttp.open('POST', "/sendNick", true);
      xhttp.setRequestHeader('Content-Type', 'application/json');
      xhttp.send(JSON.stringify({"nick": nick}));
  }

  askForChanges = function (id_game) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(res) {
      if (this.readyState == 4 && this.status == 200) {
        var data = res.target.response;
        gameController.changesInPlayers(data);
      }
    };
    xhttp.open('POST', "/askForChanges", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify({ id_game: id_game }));
  }

  changeStatus = function (id_game, nick, status) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(res) {
      if (this.readyState == 4 && this.status == 200) {
        var data = res.target.response;
        // gameController.changesInPlayers(data);
      }
    };
    xhttp.open('POST', "/changeStatus", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify({ id_game: id_game, nick: nick, status: status }));
  }

  askForQueue = function (id_game) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(res) {
      if (this.readyState == 4 && this.status == 200) {
        var data = res.target.response;
        gameController.changesInQueue(data);
      }
    };
    xhttp.open('POST', "/askForQueue", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify({ id_game: id_game }));
  }

  randomNumber = function (id_game, id_player) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(res) {
      if (this.readyState == 4 && this.status == 200) {
        var data = res.target.response;
        gameController.decision(data);
      }
    };
    xhttp.open('POST', "/randomNumber", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify({ id_game: id_game, id_player: id_player }));
  }

  clientDecision = function (obj) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(res) {
      if (this.readyState == 4 && this.status == 200) {
        var data = res.target.response;
        console.log(data)
      }
    };
    xhttp.open('POST', "/clientDecision", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(obj));
  }
}