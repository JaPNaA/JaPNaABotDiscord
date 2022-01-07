import BotPlugin from "../main/bot/plugin/plugin.js";
import BotCommandHelp from "../main/bot/command/commandHelp.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotCommand from "../main/bot/command/command.js";
import Bot from "../main/bot/bot/bot.js";
/**
 * Normal commands every bot shoud have
 */
declare class Default extends BotPlugin {
    sawUpdateBotWarning: boolean;
    constructor(bot: Bot);
    ping(bot: Bot, event: DiscordCommandEvent): void;
    eval(bot: Bot, event: DiscordCommandEvent, args: string): void;
    /**
     * Logs a message to the console with a logging level of "log"
     */
    log_message(bot: Bot, event: DiscordCommandEvent, args: string): void;
    user_info(bot: Bot, event: DiscordCommandEvent, args: string): Promise<void>;
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
    _sendGeneralHelp(bot: Bot, event: DiscordCommandEvent): Promise<void>;
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
    _createHelpEmbedObject(fields: object[], help: BotCommandHelp, event: DiscordCommandEvent, command: string, bot: Bot): object;
    /**
     * Appends the permissions for a command in help in embed
     */
    _appendHelpPermissions(fields: object[], help: BotCommandHelp): void;
    /**
     * Sends a help embed about a command
     */
    _sendHelpAboutCommand(bot: Bot, event: DiscordCommandEvent, command: string, help: BotCommandHelp): void;
    /**
     * Sends help about a command, checks if the command and command help exists
     */
    _sendSpecificHelp(bot: Bot, event: DiscordCommandEvent, command: string): void;
    /**
     * Pretends to recieve a message from soneone else
     */
    help(bot: Bot, event: DiscordCommandEvent, args: string): void;
    /**
     * Sets the bot admin
     */
    i_am_the_bot_admin(bot: Bot, event: DiscordCommandEvent): void;
    /**
     * Pretends to recieve a message from soneone else
     */
    pretend_get(bot: Bot, event: DiscordCommandEvent, args: string): Promise<void>;
    /**
     * Pretends to recieve a message from someone else
     */
    forward_to(bot: Bot, event: DiscordCommandEvent, args: string): Promise<void>;
    /**
     * Sends a message to a channel
     * @param argString arguments ns, type, action, id, permission
     */
    edit_permission(bot: Bot, event: DiscordCommandEvent, argString: string): Promise<void>;
    /**
     * Sends a message to a channel
     * @param args arguments [channelId, ...message]
     */
    send(bot: Bot, event: DiscordCommandEvent, args: string): void;
    /**
     * Sends link to add bot to server
     */
    link(bot: Bot, event: DiscordCommandEvent): void;
    /**
     * Sends link to view code of bot (like what you're doing right now!)
     */
    code(bot: Bot, event: DiscordCommandEvent): void;
    /**
     * Updates the bot
     */
    update_bot(bot: Bot, event: DiscordCommandEvent, args: string): void;
    /**
     * Actually updates the bot
     */
    _actuallyUpdateBot(bot: Bot, event: DiscordCommandEvent): void;
    _endBotProcess(): void;
    uptime(bot: Bot, event: DiscordCommandEvent, args: string): void;
    _start(): void;
    _stop(): void;
}
export default Default;
