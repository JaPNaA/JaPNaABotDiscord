/**
 * @typedef {import("./precommand")} Precommand
 */
declare class DiscordMessageEvent {
    /**
     * DiscordMessageEvent contructor
     * @param {String} username of sender
     * @param {String} userId of sender
     * @param {String} channelId in
     * @param {String} message sent
     * @param {Precommand|null} precommand is message valid command? If so, what is precommand?
     * @param {*} event websocket event
     */
    constructor(username: any, userId: any, channelId: any, serverId: any, message: any, precommand: any, event: any, isDM: any);
}
declare class DiscordCommandEvent extends DiscordMessageEvent {
    /**
     * DiscordCommandEvent constructor
     * @param {DiscordMessageEvent} messageEvent messageEvent to extend
     * @param {Precommand} pre precomxmand used
     * @param {String} content after precommand
     */
    constructor(messageEvent: any, pre: any, content: any);
}
