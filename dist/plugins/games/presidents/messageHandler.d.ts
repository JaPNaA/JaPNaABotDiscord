import PresidentsMain from "./game";
import { DiscordCommandEvent } from "../../../main/events";
declare class MessageHandler {
    game: PresidentsMain;
    constructor(presidentsGame: PresidentsMain);
    onMessage(userId: string, event: DiscordCommandEvent): void;
}
export default MessageHandler;
