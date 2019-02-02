import PresidentsMain from "./game";
import DiscordCommandEvent from "../../../main/bot/events/discordCommandEvent";
import MessageType from "./messageType";

class MessageHandler {
    game: PresidentsMain;

    constructor(presidentsGame: PresidentsMain) {
        this.game = presidentsGame;
    }

    onMessage(userId: string, event: DiscordCommandEvent, type: MessageType) {
        let player = this.game.playerHandler.getPlayer(userId);
        if (!player) return;
        player.onMessage(event, type);
    }
}

export default MessageHandler;