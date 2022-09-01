"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Othello = void 0;
const game_1 = __importDefault(require("./game"));
class Othello extends game_1.default {
    initer;
    // public lobby: Lobby;
    logic = new Logic();
    constructor(bot, parentPlugin, channelId, initer) {
        super(bot, parentPlugin, channelId);
        this.initer = initer;
        // this.gameName = "Othello";
        // this.lobby = new Lobby(this, bot);
        // this.lobby.setSettings({
        //     description: "Board game where the sandwiched pieces become yours.",
        //     dmLock: true,
        //     maxPlayers: 2,
        //     minPlayers: 1,
        //     autoStart: true
        // });
    }
    _start() {
        this.bot.client.send(this.channelId, "```" + this.logic.board.toString() + "```");
        this._registerUnknownCommandHandler(this.commandManager, event => {
            const moveRegex = /([a-h])([1-8])/i;
            const match = event.commandContent.match(moveRegex);
            if (!match) {
                this.bot.client.send(event.channelId, "Unknown command");
                return;
            }
            const [_, xStr, yStr] = match;
            const x = xStr.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
            const y = parseInt(yStr) - 1;
            try {
                this.logic.place(x, y);
            }
            catch (err) {
                this.bot.client.send(event.channelId, err + "");
                return;
            }
            this.bot.client.send(this.channelId, "```" + this.logic.board.toString() + "```");
        });
        // this.lobby.addPlayer(this.initer);
        // this.lobby.getPlayers();
    }
    _stop() {
        // this.lobby.removeAllPlayers();
    }
}
exports.Othello = Othello;
const eightDirections = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, -1],
    [1, -1]
];
class Logic {
    board = new Board();
    place(x, y) {
        if (this.board.hasPieceOn(x, y)) {
            throw new Error("Invalid move");
        }
        const possibleFlipDirections = [];
        for (const [dx, dy] of eightDirections) {
            if (this.canRayTo({ x, y, dx, dy }, this.board.darkTurn)) {
                possibleFlipDirections.push([dx, dy]);
            }
        }
        if (possibleFlipDirections.length <= 0) {
            throw new Error("Invalid move");
        }
        this.board.set(x, y, this.board.darkTurn ? Disk.dark : Disk.light);
        for (const [dx, dy] of possibleFlipDirections) {
            this.flipRayTo({ x, y, dx, dy }, this.board.darkTurn);
        }
        this.board.darkTurn = !this.board.darkTurn;
    }
    canRayTo(ray, dark) {
        const crossingDisk = dark ? Disk.light : Disk.dark;
        let x = ray.x + ray.dx;
        let y = ray.y + ray.dy;
        let atLeastOne = false;
        while (this.board.isPieceOn(x, y, crossingDisk)) {
            x += ray.dx;
            y += ray.dy;
            atLeastOne = true;
        }
        return atLeastOne && !this.board.isEmpty(x, y);
    }
    flipRayTo(ray, dark) {
        const crossingDisk = dark ? Disk.light : Disk.dark;
        const newDisk = dark ? Disk.dark : Disk.light;
        let x = ray.x + ray.dx;
        let y = ray.y + ray.dy;
        while (this.board.isPieceOn(x, y, crossingDisk)) {
            this.board.set(x, y, newDisk);
            x += ray.dx;
            y += ray.dy;
        }
    }
}
class Board {
    darkTurn = true;
    board;
    constructor() {
        this.board = [];
        for (let y = 0; y < 8; y++) {
            const row = [];
            for (let x = 0; x < 8; x++) {
                row.push(Disk.none);
            }
            this.board.push(row);
        }
        this.setupBoard();
    }
    setupBoard() {
        // light takes negative-sloping diagonal in center
        this.set(3, 3, Disk.light);
        this.set(4, 3, Disk.dark);
        // dark takes positive-sloping
        this.set(3, 4, Disk.dark);
        this.set(4, 4, Disk.light);
    }
    set(x, y, disk) {
        this.board[y][x] = disk;
    }
    isOnBoard(x, y) {
        return x >= 0 && x < 8 && y >= 0 && y < 8;
    }
    isEmpty(x, y) {
        return this.isOnBoard(x, y) && this.board[y][x] === Disk.none;
    }
    hasPieceOn(x, y) {
        return this.isOnBoard(x, y) && this.board[y][x] !== Disk.none;
    }
    isPieceOn(x, y, disk) {
        if (!this.isOnBoard(x, y)) {
            return false;
        }
        return this.board[y][x] === disk;
    }
    toString() {
        let str = [];
        for (let y = 0; y < 8; y++) {
            let row = (y + 1) + "  ";
            for (let x = 0; x < 8; x++) {
                const piece = this.board[y][x];
                row += this.diskToString(piece) + ' ';
            }
            str.push(row);
        }
        str.push("   a b c d e f g h");
        return str.join("\n");
    }
    diskToString(disk) {
        if (disk === Disk.none) {
            return ' ';
        }
        if (disk === Disk.dark) {
            return '#';
        }
        if (disk === Disk.light) {
            return 'O';
        }
    }
}
var Disk;
(function (Disk) {
    Disk[Disk["dark"] = 0] = "dark";
    Disk[Disk["light"] = 1] = "light";
    Disk[Disk["none"] = 2] = "none";
})(Disk || (Disk = {}));
;
