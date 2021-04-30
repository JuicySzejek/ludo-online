module.exports = function () {
    var opers = {
        InsertOne: function (data) {
            data.save(function (error, data, dodanych) {
                console.log("dodano " + data)
            })
        },

        SelectAll: function (Model, callback) {
            var obj = {};
            Model.find({}, function (err, data) {
                if (err) {
                    obj.data = err;
                } else {
                    obj.data = data;
                }
                callback(obj);
            })
        },

        SelectAndLimit: function (Model, count, callback) {
            var obj = {};
            Model.find({}, function (err, data) {
                if (err) obj.data = err;
                else obj.data = data;
                callback(obj);
            }).limit(count)
        },

        SelectPlayers: function (Model, id_game, callback) {
            var obj = {};
            Model.find({ id_game: id_game }, function (err, data) {
                if (err) obj.data = err;
                else obj.data = data;
                callback(obj);
            }).limit(4)
        },

        SelectOneGame: function (Model, id_game, callback) {
            var obj = {};
            Model.find({ _id: id_game }, function (err, data) {
                if (err) obj.data = err;
                else obj.data = data;
                callback(obj);
            }).limit(1)
        },

        DeleteAll: function (Model) {
            Model.remove(function (err, data) {
                if (err) return console.error(err);
            })
        },

        DeleteById: function (Model, _id) {
            Model.remove({ _id: _id }, function (err, data) {
                if (err) return console.error(err);
                console.log(data);
            })
        },

        DeleteFirst: function (Model) {
            Model.deleteOne({}, function (err, data) {
                if (err) return console.error(err);
            })
        },

        DeletePlayersByIdGame: function (Model, id_game) {
            Model.remove({ id_game: id_game }, function (err, data) {
                if (err) return console.error(err);
                console.log(data);
            })
        },

        UpdatePlayerCounter: function (Model, _id, playerCounter) {
            Model.update({ _id: _id }, { playerCounter: playerCounter }, function (err) {
                if (err) return console.error(err);
            })
        },

        UpdateStatusOfGame: function (Model, _id, statusOfGame) {
            Model.update({ _id: _id }, { statusOfGame: statusOfGame }, function (err) {
                if (err) return console.error(err);
            })
        },

        UpdateStatusOfPlayer: function (Model, id_game, nick, status, callback) {
            Model.update({ id_game: id_game, nick: nick }, { status: status }, function (err) {
                if (err) return console.error(err);
                callback();
            })
        },

        UpdateTimeOfLastStartQueue: function (Model, id_game, new_time) {
            Model.update({ _id: id_game }, { timeOfLastStartQueue: new_time }, function (err) {
                if (err) return console.error(err);
            })
        },


        UpdateStatusOfPlayers: function (Model, id_game, status, callback) {
            Model.updateMany({ id_game: id_game }, { status: status }, function (err) {
                if (err) return console.error(err);
                if (callback) callback();
            })
        },

        UpdateBoard: function (Model, id_game, board) {
            Model.update({ _id: id_game }, { board: board }, function (err) {
                if (err) return console.error(err);
            })
        },
    }

    return opers;

}