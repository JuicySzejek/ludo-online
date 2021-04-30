module.exports = function (mongoose) {
    var Schema = mongoose.Schema;

    var playerSchema = new Schema(
    {
        nick: { type: String, required: true },
        insert_time: { type: Date, required: true },
        last_activity: { type: Date, required: true },
        status: { type: Number, required: true },
        color: { type: String, required: true },
        id_game: { type: String, required: true }
    });

    var gameSchema = new Schema({
        playerCounter: { type: Number, required: true },
        statusOfGame: { type: Number, required: true }, // 0 - zbiera graczy, 1 - trwa
        timeOfLastStartQueue: { type: Date, required: false },
        board: { type: Array, required: false }
    })

    var models = {
        Player: mongoose.model("Player", playerSchema),
        Game: mongoose.model("Game", gameSchema)
    }

    return models;
}