import BotPlugin from "../main/bot/plugin/plugin.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotCommand from "../main/bot/command/command.js";
import { EmbedFieldData } from "discord.js";
import Bot from "../main/bot/bot/bot.js";
import { BotCommandHelp, BotCommandHelpFull } from "../main/bot/command/commandHelp.js";
import { ReplyPrivate, ReplyUnimportant, Send } from "../main/bot/actions/actions.js";
/**
 * Normal commands every bot shoud have
 */
declare class Default extends BotPlugin {
    sawUpdateBotWarning: boolean;
    constructor(bot: Bot);
    ping(): Generator<never, string, unknown>;
    eval(event: DiscordCommandEvent): Generator<never, string, unknown>;
    /**
     * Logs a message to the console with a logging level of "log"
     */
    log_message(event: DiscordCommandEvent): Generator<never, void, unknown>;
    user_info(event: DiscordCommandEvent): AsyncGenerator<"**User does not exist.**" | {
        embeds: {
            color: number;
            author: {
                name: string;
                icon_url: string | undefined;
            };
            fields: EmbedFieldData[];
            timestamp: Date;
        }[];
    }, void, unknown>;
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
    _sendGeneralHelp(event: DiscordCommandEvent): AsyncGenerator<ReplyPrivate | ReplyUnimportant | {
        embeds: object[];
    }, void, unknown>;
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
    _sendHelpAboutCommand(event: DiscordCommandEvent, command: string, help: BotCommandHelpFull): Generator<ReplyPrivate | ReplyUnimportant | {
        embeds: object[];
    }, void, unknown>;
    /**
     * Sends help about a command, checks if the command and command help exists
     */
    _sendSpecificHelp(event: DiscordCommandEvent, command: string): Generator<ReplyPrivate | ReplyUnimportant | {
        embeds: object[];
    }, void, unknown>;
    /**
     * Pretends to recieve a message from soneone else
     */
    help(event: DiscordCommandEvent): AsyncGenerator<ReplyPrivate | ReplyUnimportant | {
        embeds: object[];
    }, void, unknown>;
    /**
     * Sets the bot admin
     */
    i_am_the_bot_admin(event: DiscordCommandEvent): Generator<"Yes. You are the bot admin." | "You are not the bot admin." | "**`::    Y O U   A R E   T H E   B O T   A D M I N    ::`**", void, unknown>;
    /**
     * Pretends to recieve a message from soneone else
     */
    pretend_get(event: DiscordCommandEvent): AsyncGenerator<never, string | undefined, unknown>;
    /**
     * Pretends to recieve a message from someone else
     */
    forward_to(event: DiscordCommandEvent): AsyncGenerator<Send, string | undefined, unknown>;
    /**
     * Sends a message to a channel
     * @param argString arguments ns, type, action, id, permission
     */
    edit_permission(event: DiscordCommandEvent): AsyncGenerator<never, string, unknown>;
    configCommand(event: DiscordCommandEvent): AsyncGenerator<never, string, unknown>;
    private _jsonCopy;
    private _getHumanReadableConfigString;
    private _getHumanReadableConfigItemString;
    /**
     * Sends a message to a channel
     * @param args arguments [channelId, ...message]
     */
    send(event: DiscordCommandEvent): Generator<never, Send | undefined, unknown>;
    /**
     * Sends link to add bot to server
     */
    link(event: DiscordCommandEvent): Generator<never, {
        embeds: {
            color: number;
            description: string;
        }[];
    }, unknown>;
    /**
     * Sends link to view code of bot (like what you're doing right now!)
     */
    code(event: DiscordCommandEvent): Generator<never, string, unknown>;
    /**
     * Updates the bot
     */
    update_bot(event: DiscordCommandEvent): AsyncGenerator<string, void, unknown>;
    /**
     * Actually updates the bot
     */
    _actuallyUpdateBot(bot: Bot, event: DiscordCommandEvent): AsyncGenerator<"Error updating bot. See logs." | "Update successful. Stopping...", void, unknown>;
    _endBotProcess(): void;
    uptime(event: DiscordCommandEvent): AsyncGenerator<never, string, unknown>;
    private _JSCodeBlock;
    _start(): void;
    _stop(): void;
}
export default Default;
