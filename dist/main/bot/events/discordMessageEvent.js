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
    constructor(data) {
        this.username = data.username;
        this.userId = data.userId;
        this.channelId = data.channelId;
        this.serverId = data.serverId;
        this.message = data.message;
        this.precommandName = data.precommandName;
        this.originalEvent = data.originalEvent;
        this.isDM = data.isDM;
        this.createdTimestamp = data.createdTimestamp;
    }
}
exports.default = DiscordMessageEvent;
