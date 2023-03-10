import PresidentsMain from "./game";
import DiscordCommandEvent from "../../../main/bot/events/discordCommandEvent";
import MessageType from "./messageType";
declare class MessageHandler {
    game: PresidentsMain;
    constructor(presidentsGame: PresidentsMain);
    onMessage(userId: string, event: DiscordCommandEvent, type: MessageType): void;
}
export default MessageHandler;
