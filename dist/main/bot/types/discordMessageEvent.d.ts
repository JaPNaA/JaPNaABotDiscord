import PrecommandName from "../precommand/precommandName";
import IMessage from "../../adapters/IMessage";
declare class DiscordMessageEvent {
    /** Username of sender */
    username: string;
    /** Id of sender */
    userId: string;
    /** Id of channel message was sent in */
    channelId: string;
    /** Id of server message was sent in */
    serverId: string;
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
    /**
     * DiscordMessageEvent contructor
     * @param username of sender
     * @param userId of sender
     * @param channelId in
     * @param message sent
     * @param precommandName is message valid command? If so, what is precommand?
     * @param event websocket event
     */
    constructor(data: {
        username: string;
        userId: string;
        channelId: string;
        serverId: string;
        message: string;
        precommandName: PrecommandName | null;
        originalEvent: IMessage;
        isDM: boolean;
        createdTimestamp: number;
    });
}
export default DiscordMessageEvent;
