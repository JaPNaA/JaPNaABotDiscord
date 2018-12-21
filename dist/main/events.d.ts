import Precommand from "./precommand";
import { Message } from "discord.js";
declare class DiscordMessageEvent {
    username: string;
    userId: string;
    channelId: string;
    serverId: string;
    message: string;
    precommand: Precommand | null;
    originalEvent: Message;
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
    constructor(username: string, userId: string, channelId: string, serverId: string, message: string, precommand: Precommand | null, event: Message, isDM: boolean);
}
export { DiscordMessageEvent };
declare class DiscordCommandEvent extends DiscordMessageEvent {
    commandContent: string;
    precommand: Precommand;
    constructor(messageEvent: DiscordMessageEvent, pre: Precommand, content: string);
}
export { DiscordCommandEvent };
