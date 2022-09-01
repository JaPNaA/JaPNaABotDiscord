import BotPlugin from "../main/bot/plugin/plugin.js";
import Bot from "../main/bot/bot/bot";
export default class SlashCommands extends BotPlugin {
    constructor(bot: Bot);
    _start(): Promise<void>;
    _stop(): void;
}
