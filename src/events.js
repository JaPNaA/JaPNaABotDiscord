class DiscordMessageEvent {
    /**
     * DiscordMessageEvent contructor
     * @param {String} username of sender
     * @param {String} userId of sender
     * @param {String} channelId in
     * @param {String} message sent
     * @param {Boolean|String} precommand is message valid command? If so, what is precommand?
     * @param {*} event websocket event
     */
    constructor(username, userId, channelId, message, precommand, event) {
        this.username = username;
        this.userId = userId;
        this.channelId = channelId;
        this.message = message;
        this.wsevent = event;
        this.precommand = precommand;
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
        super(messageEvent.username, messageEvent.userId, messageEvent.channelId, messageEvent.message, messageEvent.precommand, messageEvent.wsevent);
        this.precommand = pre;
        this.commandContent = content;
    }
}

module.exports.DiscordCommandEvent = DiscordCommandEvent;