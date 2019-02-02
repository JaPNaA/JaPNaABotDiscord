import DiscordCommandEvent from "../../../main/bot/events/discordCommandEvent";
import MessageType from "./messageType";
interface MessageEvent {
    message: DiscordCommandEvent;
    type: MessageType;
}
export default MessageEvent;
