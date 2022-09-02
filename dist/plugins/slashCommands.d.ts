import BotPlugin from "../main/bot/plugin/plugin.js";
import Bot from "../main/bot/bot/bot";
export default class SlashCommands extends BotPlugin {
    private precommand;
    constructor(bot: Bot);
    _start(): Promise<void>;
    private findMatchingCommand;
    private strReplaceSpaces;
    private cleanCommandName;
    _stop(): void;
}
