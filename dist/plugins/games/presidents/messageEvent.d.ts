import { DiscordCommandEvent } from "../../../main/events";
import MessageType from "./messageType";
interface MessageEvent {
    message: DiscordCommandEvent;
    type: MessageType;
}
export default MessageEvent;
