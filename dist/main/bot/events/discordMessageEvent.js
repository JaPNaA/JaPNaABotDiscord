"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DiscordMessageEvent {
    /** Username of sender */
    username;
    /** Id of sender */
    userId;
    /** Id of channel message was sent in */
    channelId;
    /** Id of server message was sent in */
    serverId;
    /** Id of message */
    messageId;
    /** Message that was sent */
    message;
    /** Precommand used, if any */
    precommandName;
    /** WebSocket event data */
    originalEvent;
    /** Is the message from Direct Messages? */
    isDM;
    /** When the message was sent */
    createdTimestamp;
    /**
     * DiscordMessageEvent contructor
     * @param username of sender
     * @param userId of sender
     * @param channelId in
     * @param message sent
     * @param precommandName is message valid command? If so, what is precommand?
     * @param event websocket event
     */
    constructor(data) {
        this.username = data.username;
        this.userId = data.userId;
        this.channelId = data.channelId;
        this.serverId = data.serverId || "";
        this.messageId = data.messageId;
        this.message = data.message;
        this.precommandName = data.precommandName;
        this.originalEvent = data.originalEvent;
        this.isDM = data.isDM;
        this.createdTimestamp = data.createdTimestamp;
    }
}
exports.default = DiscordMessageEvent;
