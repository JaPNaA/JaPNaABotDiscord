import PrecommandName from "./bot/precommand/precommandName";
import IMessage from "./adapters/IMessage";

class DiscordMessageEvent {
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
    /**
     * DiscordMessageEvent contructor
     * @param username of sender
     * @param userId of sender
     * @param channelId in
     * @param message sent
     * @param precommandName is message valid command? If so, what is precommand?
     * @param event websocket event
     */
    constructor(username: string, userId: string, channelId: string, serverId: string, message: string, precommandName: PrecommandName | null, event: IMessage, isDM: boolean) {
        this.username = username;
        this.userId = userId;
        this.channelId = channelId;
        this.serverId = serverId;
        this.message = message;
        this.precommandName = precommandName;
        this.originalEvent = event;
        this.isDM = isDM;
    }
}

export { DiscordMessageEvent };

class DiscordCommandEvent extends DiscordMessageEvent {
    /** What came after the precommand */
    commandContent: string;
    /** Precommand used */
    precommandName: PrecommandName;

    constructor(messageEvent: DiscordMessageEvent, pre: PrecommandName, content: string) {
        // inheirt all properties of DiscordMessageEvent
        super(
            messageEvent.username, messageEvent.userId, messageEvent.channelId,
            messageEvent.serverId, messageEvent.message, messageEvent.precommandName,
            messageEvent.originalEvent, messageEvent.isDM
        );

        this.precommandName = pre;
        this.commandContent = content;
    }
}

export { DiscordCommandEvent };