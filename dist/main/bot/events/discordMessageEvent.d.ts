import PrecommandName from "../precommand/precommandName";
import IMessage from "../../adapters/IMessage";
interface DiscordMessageEvent {
    /** Username of sender */
    username: string;
    /** Id of sender */
    userId: string;
    /** Id of channel message was sent in */
    channelId: string;
    /** Id of server message was sent in */
    serverId: string;
    /** Id of message */
    messageId: string;
    /** Message that was sent */
    message: string;
    /** Precommand used, if any */
    precommandName: PrecommandName | null;
    /** WebSocket event data */
    originalEvent: IMessage;
    /** Is the message from Direct Messages? */
    isDM: boolean;
    /** When the message was sent */
    createdTimestamp: number;
}
export default DiscordMessageEvent;
