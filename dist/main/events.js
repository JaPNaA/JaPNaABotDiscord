"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DiscordMessageEvent {
    /**
     * DiscordMessageEvent contructor
     * @param username of sender
     * @param userId of sender
     * @param channelId in
     * @param message sent
     * @param precommandName is message valid command? If so, what is precommand?
     * @param event websocket event
     */
    constructor(username, userId, channelId, serverId, message, precommandName, event, isDM) {
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
exports.DiscordMessageEvent = DiscordMessageEvent;
class DiscordCommandEvent extends DiscordMessageEvent {
    constructor(messageEvent, pre, content) {
        // inheirt all properties of DiscordMessageEvent
        super(messageEvent.username, messageEvent.userId, messageEvent.channelId, messageEvent.serverId, messageEvent.message, messageEvent.precommandName, messageEvent.originalEvent, messageEvent.isDM);
        this.precommandName = pre;
        this.commandContent = content;
    }
}
exports.DiscordCommandEvent = DiscordCommandEvent;
