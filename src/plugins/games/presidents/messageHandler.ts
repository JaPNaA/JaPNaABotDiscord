import PresidentsMain from "./game";
import { DiscordCommandEvent } from "../../../main/events";

class MessageHandler {
    game: PresidentsMain;

    constructor(presidentsGame: PresidentsMain) {
        this.game = presidentsGame;
    }

    onMessage(userId: string, event: DiscordCommandEvent) {
        let player = this.game.playerHandler.getPlayer(userId);
        if (!player) return;
        player.onMessage(event);
    }
}

export default MessageHandler;