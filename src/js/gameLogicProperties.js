var plansza = [
    { pos_x: 38, pos_y: 357, field: 0 },
    { pos_x: 107, pos_y: 357, field: 1 },
    { pos_x: 176, pos_y: 357, field: 2 },
    { pos_x: 246, pos_y: 357, field: 3 },
    { pos_x: 316, pos_y: 357, field: 4 },
    { pos_x: 316, pos_y: 288, field: 5 },
    { pos_x: 316, pos_y: 219, field: 6 },
    { pos_x: 316, pos_y: 149, field: 7 },
    { pos_x: 316, pos_y: 79, field: 8 },
    { pos_x: 386, pos_y: 79, field: 9 },
    { pos_x: 456, pos_y: 79, field: 10 },
    { pos_x: 456, pos_y: 148, field: 11 },
    { pos_x: 456, pos_y: 217, field: 12 },
    { pos_x: 456, pos_y: 287, field: 13 },
    { pos_x: 456, pos_y: 357, field: 14 },
    { pos_x: 525, pos_y: 357, field: 15 },
    { pos_x: 594, pos_y: 357, field: 16 },
    { pos_x: 664, pos_y: 357, field: 17 },
    { pos_x: 734, pos_y: 357, field: 18 },
    { pos_x: 734, pos_y: 427, field: 19 },
    { pos_x: 734, pos_y: 497, field: 20 },
    { pos_x: 665, pos_y: 497, field: 21 },
    { pos_x: 596, pos_y: 497, field: 22 },
    { pos_x: 526, pos_y: 497, field: 23 },
    { pos_x: 456, pos_y: 497, field: 24 },
    { pos_x: 456, pos_y: 566, field: 25 },
    { pos_x: 456, pos_y: 635, field: 26 },
    { pos_x: 456, pos_y: 705, field: 27 },
    { pos_x: 456, pos_y: 775, field: 28 },
    { pos_x: 386, pos_y: 775, field: 29 },
    { pos_x: 316, pos_y: 775, field: 30 },
    { pos_x: 316, pos_y: 706, field: 31 },
    { pos_x: 316, pos_y: 637, field: 32 },
    { pos_x: 316, pos_y: 567, field: 33 },
    { pos_x: 316, pos_y: 497, field: 34 },
    { pos_x: 247, pos_y: 497, field: 35 },
    { pos_x: 178, pos_y: 497, field: 36 },
    { pos_x: 108, pos_y: 497, field: 37 },
    { pos_x: 38, pos_y: 497, field: 38 },
    { pos_x: 38, pos_y: 427, field: 39 },
    { pos_x: 107, pos_y: 427, field: 40, player: "red" },
    { pos_x: 176, pos_y: 427, field: 41, player: "red" },
    { pos_x: 246, pos_y: 427, field: 42, player: "red" },
    { pos_x: 316, pos_y: 427, field: 43, player: "red" },
    { pos_x: 386, pos_y: 148, field: 40, player: "blue" },
    { pos_x: 386, pos_y: 217, field: 41, player: "blue" },
    { pos_x: 386, pos_y: 286, field: 42, player: "blue" },
    { pos_x: 386, pos_y: 356, field: 43, player: "blue" },
    { pos_x: 664, pos_y: 426, field: 40, player: "green" },
    { pos_x: 595, pos_y: 426, field: 41, player: "green" },
    { pos_x: 526, pos_y: 426, field: 42, player: "green" },
    { pos_x: 456, pos_y: 426, field: 43, player: "green" },
    { pos_x: 386, pos_y: 704, field: 40, player: "yellow" },
    { pos_x: 386, pos_y: 635, field: 41, player: "yellow" },
    { pos_x: 386, pos_y: 566, field: 42, player: "yellow" },
    { pos_x: 386, pos_y: 496, field: 43, player: "yellow" },
];

var colors_associate = {
    "#ff0000": {
        color: "red",
        number: 0
    },
    "#0000ff": {
        color: "blue",
        number: 10
    },
    "#00ff00": {
        color: "green",
        number: 20
    },
    "#ffff00": {
        color: "yellow",
        number: 30
    },
}

function setFields (color) {
    var i = 0;
    while (i < plansza.length) {
        var field = plansza[i];
        field.absoluteField = field.field;
        if (field.player == undefined) {
            field.field -= colors_associate[color].number;
            if (field.field < 0) {
                field.field += 40;
            }
        }
        i++;
    }
    plansza.sort(function (x, y) {
        return x.field > y.field;
    })


}