import Bot from "../main/bot/bot/bot.js";
import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";
import BotPlugin from "../main/bot/plugin/plugin.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent.js";
/**
 * Autothread plugin; automatically makes threads
 */
export default class AutoThread extends BotPlugin {
    private activeChannels;
    private cooldowns;
    constructor(bot: Bot);
    toggleAutothread(event: DiscordCommandEvent): Promise<void>;
    messageHandler(event: DiscordMessageEvent): Promise<void>;
    private _isNaturalMessage;
    private isCool;
    private setCooldown;
    private writeToMemory;
    _start(): void;
    _stop(): void;
}
