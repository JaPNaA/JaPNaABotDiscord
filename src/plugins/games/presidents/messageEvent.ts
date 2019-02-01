import DiscordCommandEvent from "../../../main/bot/types/discordCommandEvent";
import MessageType from "./messageType";

interface MessageEvent {
    message: DiscordCommandEvent, 
    type: MessageType;
}

export default MessageEvent;