class DiscordMessageEvent {
    /**
     * DiscordMessageEvent contructor
     * @param {String} username of sender
     * @param {String} userId of sender
     * @param {String} channelId in
     * @param {String} message sent
     * @param {String|null} precommand is message valid command? If so, what is precommand?
     * @param {*} event websocket event
     */
    constructor(username, userId, channelId, message, precommand, event) {
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
         * Message that was sent
         * @type {String}
         */
        this.message = message;

        /**
         * Precommand used, if any
         * @type {String|null}
         */
        this.precommand = precommand;

        /**
         * WebSocket event data
         */
        this.wsevent = event;
    }
}

module.exports.DiscordMessageEvent = DiscordMessageEvent;

class DiscordCommandEvent extends DiscordMessageEvent {
    /**
     * DiscordCommandEvent constructor
     * @param {DiscordMessageEvent} messageEvent messageEvent to extend
     * @param {String} pre precommand used
     * @param {String} content after precommand
     */
    constructor(messageEvent, pre, content) {
        // inheirt all properties of DiscordMessageEvent
        super(messageEvent.username, messageEvent.userId, messageEvent.channelId, messageEvent.message, messageEvent.precommand, messageEvent.wsevent);

        /**
         * Precommand used
         * @type {String}
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