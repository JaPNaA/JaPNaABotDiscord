import BotPlugin from "../main/bot/plugin/plugin.js";
import BotCommandHelp from "../main/bot/command/commandHelp.js";
import BotHooks from "../main/bot/botHooks.js";
import { DiscordCommandEvent } from "../main/events.js";
import BotCommand from "../main/bot/command/command.js";
/**
 * Normal commands every bot shoud have
 */
declare class Default extends BotPlugin {
    sawUpdateBotWarning: boolean;
    constructor(bot: BotHooks);
    ping(bot: BotHooks, event: DiscordCommandEvent): void;
    eval(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    /**
     * Logs a message to the console with a logging level of "log"
     */
    log_message(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    user_info(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    /**
     * Converts all commands to a readable format
     * @param bot bot
     * @param event message event data
     * @param commands
     */
    _commandsToReadable(bot: BotHooks, event: DiscordCommandEvent, commands: BotCommand[]): string;
    /**
     * Sends general help information (all commands)
     */
    _sendGeneralHelp(bot: BotHooks, event: DiscordCommandEvent): void;
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
    _createHelpEmbedObject(fields: object[], help: BotCommandHelp, event: DiscordCommandEvent, command: string, bot: BotHooks): {
        embed: {
            color: number;
            title: string;
            description: string;
            fields: object[];
        };
    };
    /**
     * Appends the permissions for a command in help in embed
     */
    _appendHelpPermissions(fields: object[], help: BotCommandHelp): void;
    /**
     * Sends a help embed about a command
     */
    _sendHelpAboutCommand(bot: BotHooks, event: DiscordCommandEvent, command: string, help: BotCommandHelp): void;
    /**
     * Sends help about a command, checks if the command and command help exists
     */
    _sendSpecificHelp(bot: BotHooks, event: DiscordCommandEvent, command: string): void;
    /**
     * Pretends to recieve a message from soneone else
     */
    help(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    /**
     * Sets the bot admin
     */
    i_am_the_bot_admin(bot: BotHooks, event: DiscordCommandEvent): void;
    /**
     * Pretends to recieve a message from soneone else
     */
    pretend_get(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    /**
     * Pretends to recieve a message from someone else
     */
    forward_to(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    /**
     * Sends a message to a channel
     * @param argString arguments ns, type, action, id, permission
     */
    edit_permission(bot: BotHooks, event: DiscordCommandEvent, argString: string): void;
    /**
     * Sends a message to a channel
     * @param args arguments [channelId, ...message]
     */
    send(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    /**
     * Sends link to add bot to server
     */
    link(bot: BotHooks, event: DiscordCommandEvent): void;
    /**
     * Sends link to view code of bot (like what you're doing right now!)
     */
    code(bot: BotHooks, event: DiscordCommandEvent): void;
    /**
     * Updates the bot
     */
    update_bot(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    /**
     * Actually updates the bot
     */
    _actuallyUpdateBot(bot: BotHooks, event: DiscordCommandEvent): void;
    _endBotProcess(): void;
    _start(): void;
    _stop(): void;
}
export default Default;
