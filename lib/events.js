/**
 * @typedef {import("./precommand")} Precommand
 */

class DiscordMessageEvent {
    /**
     * DiscordMessageEvent contructor
     * @param {String} username of sender
     * @param {String} userId of sender
     * @param {String} channelId in
     * @param {String} message sent
     * @param {Precommand|null} precommand is message valid command? If so, what is precommand?
     * @param {*} event websocket event
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

        /**
         * Id of server message was sent in
         */
        this.serverId = serverId;

        /**
         * Message that was sent
         * @type {String}
         */
        this.message = message;

        /**
         * Precommand used, if any
         * @type {Precommand|null}
         */
        this.precommand = precommand;

        /**
         * WebSocket event data
         */
        this.wsevent = event;

        this.isDM = isDM;
    }
}

module.exports.DiscordMessageEvent = DiscordMessageEvent;

class DiscordCommandEvent extends DiscordMessageEvent {
    /**
     * DiscordCommandEvent constructor
     * @param {DiscordMessageEvent} messageEvent messageEvent to extend
     * @param {Precommand} pre precomxmand used
     * @param {String} content after precommand
     */
    constructor(messageEvent, pre, content) {
        // inheirt all properties of DiscordMessageEvent
        super(
            messageEvent.username, messageEvent.userId, messageEvent.channelId,
            messageEvent.serverId, messageEvent.message, messageEvent.precommand,
            messageEvent.wsevent, messageEvent.isDM
        );

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

module.exports.DiscordCommandEvent = DiscordCommandEvent;