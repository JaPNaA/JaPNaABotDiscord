import BotPlugin from "../main/plugin.js";
import BotCommandHelp from "../main/botcommandHelp.js";
import BotHooks from "../main/bot/botHooks.js";
import { DiscordCommandEvent } from "../main/events.js";
import BotCommand from "../main/botcommand.js";
/**
 * @typedef {import("../events.js").DiscordCommandEvent} DiscordCommandEvent
 * @typedef {import("../bot/botHooks.js").default} BotHooks
 * @typedef {import("../botcommand.js").default} BotCommand
 */
/**
 * Normal commands every bot shoud have
 */
declare class Default extends BotPlugin {
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
     * @param {BotHooks} bot bot
     * @param {DiscordCommandEvent} event message event data
     * @param {BotCommand[]} commands
     */
    _commandsToReadable(bot: BotHooks, event: DiscordCommandEvent, commands: BotCommand[]): string;
    /**
     * Sends general help information
     * @param {BotHooks} bot bot
     * @param {DiscordCommandEvent} event message event
     */
    _sendGeneralHelp(bot: BotHooks, event: DiscordCommandEvent): void;
    /**
     * Appends the overloads for help
     * @param {Object[]} fields feilds in embed
     * @param {BotCommandHelp} help help
     * @param {DiscordCommandEvent} event event
     * @param {String} command command
     */
    _appendHelpOverloads(fields: object[], help: BotCommandHelp, event: DiscordCommandEvent, command: string): void;
    /**
     * Appends the overloads for help
     * @param {Object[]} fields feilds in embed
     * @param {BotCommandHelp} help help
     * @param {DiscordCommandEvent} event event
     */
    _appendHelpExamples(fields: object[], help: BotCommandHelp, event: DiscordCommandEvent): void;
    /**
     * Creates an help embed object
     * @param {Object[]} fields feilds in embed
     * @param {BotCommandHelp} help help
     * @param {DiscordCommandEvent} event event
     * @param {String} command help of command
     * @param {BotHooks} bot bot
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
     * Appends the permissions for a command in help
     * @param {Object[]} fields fields in embed, to append to
     * @param {BotCommandHelp} help help data
     */
    _appendHelpPermissions(fields: object[], help: BotCommandHelp): void;
    /**
     * Sends a help embed about a command
     * @param {BotHooks} bot bot
     * @param {DiscordCommandEvent} event message event
     * @param {String} command command to get help about
     * @param {BotCommandHelp} help help
     */
    _sendHelpAboutCommand(bot: BotHooks, event: DiscordCommandEvent, command: string, help: BotCommandHelp): void;
    /**
     * Sends help about a single command
     * @param {BotHooks} bot bot
     * @param {DiscordCommandEvent} event message event
     * @param {String} command name of command to send help of
     */
    _sendSpecificHelp(bot: BotHooks, event: DiscordCommandEvent, command: string): void;
    /**
     * Pretends to recieve a message from soneone else
     * @param {BotHooks} bot bot
     * @param {DiscordCommandEvent} event message event
     * @param {String} args arguments
     */
    help(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    /**
     * Sets the bot admin
     * @param {BotHooks} bot bot
     * @param {DiscordCommandEvent} event message event
     */
    i_am_the_bot_admin(bot: BotHooks, event: DiscordCommandEvent): void;
    /**
     * Pretends to recieve a message from soneone else
     * @param {BotHooks} bot bot
     * @param {DiscordCommandEvent} event message event
     * @param {String} args arguments
     */
    pretend_get(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    /**
     * Pretends to recieve a message from soneone else
     * @param {BotHooks} bot bot
     * @param {DiscordCommandEvent} event message event
     * @param {String} args arguments
     */
    forward_to(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    /**
     * Sends a message to a channel
     * @param {BotHooks} bot bot
     * @param {DiscordCommandEvent} event message event
     * @param {String} argString arguments ns, type, action, id, permission
     */
    edit_permission(bot: BotHooks, event: DiscordCommandEvent, argString: string): void;
    /**
     * Sends a message to a channel
     * @param {BotHooks} bot bot
     * @param {DiscordCommandEvent} event message event
     * @param {String} args arguments [channelId, ...message]
     */
    send(bot: BotHooks, event: DiscordCommandEvent, args: string): void;
    /**
     * Sends link to add bot to server
     * @param {BotHooks} bot bot
     * @param {DiscordCommandEvent} event message event
     */
    link(bot: BotHooks, event: DiscordCommandEvent): void;
    /**
     * Sends link to view code of bot (like what you're doing right now!)
     * @param {BotHooks} bot bot
     * @param {DiscordCommandEvent} event message event
     */
    code(bot: BotHooks, event: DiscordCommandEvent): void;
    _start(): void;
}
export default Default;
