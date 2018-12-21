import Precommand from "./precommand";
import { WSEventType } from "discord.js";

/**
 * @typedef {import("./precommand")} Precommand
 */

class DiscordMessageEvent {
    username: string;
    userId: string;
    channelId: string;
    serverId: string;
    message: string;
    precommand: Precommand | null;
    wsevent: WSEventType;
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
    constructor(username: string, userId: string, channelId: string, serverId: string, message: string, precommand: Precommand | null, event: WSEventType, isDM: boolean) {
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
        this.wsevent = event;

        /** Is the message from Direct Messages? */
        this.isDM = isDM;
    }
}

export { DiscordMessageEvent };

class DiscordCommandEvent extends DiscordMessageEvent {
    commandContent: string;
    precommand: Precommand;
    /**
     * DiscordCommandEvent constructor
     * @param {DiscordMessageEvent} messageEvent messageEvent to extend
     * @param {Precommand} pre precomxmand used
     * @param {String} content after precommand
     */
    constructor(messageEvent: DiscordMessageEvent, pre: Precommand, content: string) {
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

export { DiscordCommandEvent };