import BotPlugin from "../main/bot/plugin/plugin.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotCommand from "../main/bot/command/command.js";
import Bot from "../main/bot/bot/bot.js";
import { BotCommandHelp, BotCommandHelpFull } from "../main/bot/command/commandHelp.js";
/**
 * Normal commands every bot shoud have
 */
declare class Default extends BotPlugin {
    sawUpdateBotWarning: boolean;
    constructor(bot: Bot);
    ping(event: DiscordCommandEvent): void;
    eval(event: DiscordCommandEvent): void;
    /**
     * Logs a message to the console with a logging level of "log"
     */
    log_message(event: DiscordCommandEvent): void;
    user_info(event: DiscordCommandEvent): Promise<void>;
    /**
     * Converts all commands to a readable format
     * @param bot bot
     * @param event message event data
     * @param commands
     */
    _commandsToReadable(bot: Bot, event: DiscordCommandEvent, commands: BotCommand[]): Promise<string>;
    /**
     * Sends general help information (all commands)
     */
    _sendGeneralHelp(event: DiscordCommandEvent): Promise<void>;
    /**
     * Appends the overloads for help in embed
     */
    _appendHelpOverloads(fields: object[], help: BotCommandHelp, event: DiscordCommandEvent, command: string): void;
    /**
     * Appends the overloads for help in embed
     */
    _appendHelpExamples(fields: object[], help: BotCommandHelp, event: DiscordCommandEvent): void;
    /**
     * Creates an help embed object in embed
     */
    _createHelpEmbedObject(fields: object[], help: BotCommandHelpFull, event: DiscordCommandEvent, command: string, bot: Bot): object;
    /**
     * Appends the permissions for a command in help in embed
     */
    _appendHelpPermissions(fields: object[], help: BotCommandHelpFull): void;
    /**
     * Sends a help embed about a command
     */
    _sendHelpAboutCommand(event: DiscordCommandEvent, command: string, help: BotCommandHelpFull): void;
    /**
     * Sends help about a command, checks if the command and command help exists
     */
    _sendSpecificHelp(event: DiscordCommandEvent, command: string): void;
    /**
     * Pretends to recieve a message from soneone else
     */
    help(event: DiscordCommandEvent): void;
    /**
     * Sets the bot admin
     */
    i_am_the_bot_admin(event: DiscordCommandEvent): void;
    /**
     * Pretends to recieve a message from soneone else
     */
    pretend_get(event: DiscordCommandEvent): Promise<void>;
    /**
     * Pretends to recieve a message from someone else
     */
    forward_to(event: DiscordCommandEvent): Promise<void>;
    /**
     * Sends a message to a channel
     * @param argString arguments ns, type, action, id, permission
     */
    edit_permission(event: DiscordCommandEvent): Promise<void>;
    configCommand(event: DiscordCommandEvent): Promise<void>;
    private _getHumanReadableConfigString;
    private _getHumanReadableConfigItemString;
    /**
     * Sends a message to a channel
     * @param args arguments [channelId, ...message]
     */
    send(event: DiscordCommandEvent): void;
    /**
     * Sends link to add bot to server
     */
    link(event: DiscordCommandEvent): void;
    /**
     * Sends link to view code of bot (like what you're doing right now!)
     */
    code(event: DiscordCommandEvent): void;
    /**
     * Updates the bot
     */
    update_bot(event: DiscordCommandEvent): void;
    /**
     * Actually updates the bot
     */
    _actuallyUpdateBot(bot: Bot, event: DiscordCommandEvent): void;
    _endBotProcess(): void;
    uptime(event: DiscordCommandEvent): void;
    private _sendJSCodeBlock;
    _start(): void;
    _stop(): void;
}
export default Default;
