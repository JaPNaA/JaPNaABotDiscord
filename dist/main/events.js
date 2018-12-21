"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @typedef {import("./precommand")} Precommand
 */
class DiscordMessageEvent {
    /**
     * DiscordMessageEvent contructor
     * @param username of sender
     * @param userId of sender
     * @param channelId in
     * @param message sent
     * @param precommand is message valid command? If so, what is precommand?
     * @param event websocket event
     */
    constructor(username, userId, channelId, serverId, message, precommand, event, isDM) {
        /**
         * Username of sender
         * @type {String}
         */
        this.username = username;
        /**
         * Id of sender
         * @type {String}
         */
        this.userId = userId;
        /**
         * Id of channel message was sent in
         * @type {String}
         */
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
exports.DiscordMessageEvent = DiscordMessageEvent;
class DiscordCommandEvent extends DiscordMessageEvent {
    /**
     * DiscordCommandEvent constructor
     * @param {DiscordMessageEvent} messageEvent messageEvent to extend
     * @param {Precommand} pre precomxmand used
     * @param {String} content after precommand
     */
    constructor(messageEvent, pre, content) {
        // inheirt all properties of DiscordMessageEvent
        super(messageEvent.username, messageEvent.userId, messageEvent.channelId, messageEvent.serverId, messageEvent.message, messageEvent.precommand, messageEvent.originalEvent, messageEvent.isDM);
        /**
         * Precommand used
         * @type {Precommand}
         */
        this.precommand = pre;
        /**
         * What came after the precommand
         * @type {String}
         */
        this.commandContent = content;
    }
}
exports.DiscordCommandEvent = DiscordCommandEvent;
