import Bot from "../../main/bot/bot/bot";
import Games from "../games";
import Game from "./game";
import Lobby from "./utils/lobby";

export class Othello extends Game {
    // public lobby: Lobby;
    public logic = new Logic();

    constructor(bot: Bot, parentPlugin: Games, channelId: string, private initer: string) {
        super(bot, parentPlugin, channelId);
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
        this.bot.client.send(this.channelId,
            "```" + this.logic.board.toString() + "```"
        );
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
            } catch (err) {
                this.bot.client.send(event.channelId, err + "");
                return;
            }

            this.bot.client.send(this.channelId,
                "```" + this.logic.board.toString() + "```"
            );
        });
        // this.lobby.addPlayer(this.initer);
        // this.lobby.getPlayers();
    }

    _stop() {
        // this.lobby.removeAllPlayers();
    }
}

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
    public board = new Board();

    public place(x: number, y: number) {
        if (this.board.hasPieceOn(x, y)) {
            throw new Error("Invalid move");
        }
        const possibleFlipDirections: [number, number][] = [];
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

    private canRayTo(ray: Ray, dark: boolean) {
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

    private flipRayTo(ray: Ray, dark: boolean) {
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

interface Ray {
    x: number; y: number;
    dx: number; dy: number;
}

class Board {
    public darkTurn: boolean = true;

    private board: Disk[][];

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

    private setupBoard() {
        // light takes negative-sloping diagonal in center
        this.set(3, 3, Disk.light);
        this.set(4, 3, Disk.dark);
        // dark takes positive-sloping
        this.set(3, 4, Disk.dark);
        this.set(4, 4, Disk.light);
    }

    public set(x: number, y: number, disk: Disk) {
        this.board[y][x] = disk;
    }

    public isOnBoard(x: number, y: number) {
        return x >= 0 && x < 8 && y >= 0 && y < 8;
    }

    public isEmpty(x: number, y: number) {
        return this.isOnBoard(x, y) && this.board[y][x] === Disk.none;
    }

    public hasPieceOn(x: number, y: number) {
        return this.isOnBoard(x, y) && this.board[y][x] !== Disk.none;
    }

    public isPieceOn(x: number, y: number, disk: Disk) {
        if (!this.isOnBoard(x, y)) { return false; }
        return this.board[y][x] === disk;
    }

    public toString(): string {
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

    private diskToString(disk: Disk) {
        if (disk === Disk.none) { return ' '; }
        if (disk === Disk.dark) { return '#'; }
        if (disk === Disk.light) { return 'O'; }
    }
}

enum Disk {
    dark, light, none
};
