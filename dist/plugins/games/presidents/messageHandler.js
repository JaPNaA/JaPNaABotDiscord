"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MessageHandler {
    constructor(presidentsGame) {
        this.game = presidentsGame;
    }
    onMessage(userId, event, type) {
        let player = this.game.playerHandler.getPlayer(userId);
        if (!player)
            return;
        player.onMessage(event, type);
    }
}
exports.default = MessageHandler;
