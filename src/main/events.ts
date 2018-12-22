import Precommand from "./bot/precommand/precommand";
import IMessage from "./adapters/IMessage";

class DiscordMessageEvent {
    username: string;
    userId: string;
    channelId: string;
    serverId: string;
    message: string;
    precommand: Precommand | null;
    originalEvent: IMessage;
    isDM: boolean;
    /**
     * DiscordMessageEvent contructor
     * @param username of sender
     * @param userId of sender
     * @param channelId in
     * @param message sent
     * @param precommand is message valid command? If so, what is precommand?
     * @param event websocket event
     */
    constructor(username: string, userId: string, channelId: string, serverId: string, message: string, precommand: Precommand | null, event: IMessage, isDM: boolean) {
        /** Username of sender */
        this.username = username;

        /** Id of sender */
        this.userId = userId;

        /** Id of channel message was sent in */
        this.channelId = channelId;

        /** Id of server message was sent in */
        this.serverId = serverId;

        /** Message that was sent */
        this.message = message;

        /** Precommand used, if any */
        this.precommand = precommand;

        /** WebSocket event data */
        this.originalEvent = event;

        /** Is the message from Direct Messages? */
        this.isDM = isDM;
    }
}

export { DiscordMessageEvent };

class DiscordCommandEvent extends DiscordMessageEvent {
    commandContent: string;
    precommand: Precommand;

    constructor(messageEvent: DiscordMessageEvent, pre: Precommand, content: string) {
        // inheirt all properties of DiscordMessageEvent
        super(
            messageEvent.username, messageEvent.userId, messageEvent.channelId,
            messageEvent.serverId, messageEvent.message, messageEvent.precommand,
            messageEvent.originalEvent, messageEvent.isDM
        );

        /** Precommand used */
        this.precommand = pre;

        /** What came after the precommand */
        this.commandContent = content;
    }
}

export { DiscordCommandEvent };