import Bot from "../main/bot/bot/bot.js";
import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";
import BotPlugin from "../main/bot/plugin/plugin.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent.js";
import { EventControls } from "../main/bot/events/eventHandlers.js";
import { ReplyUnimportant, Send } from "../main/bot/actions/actions.js";
/**
 * Autothread plugin; automatically makes threads
 */
export default class AutoThread extends BotPlugin {
    userConfigSchema: {
        enabled: {
            type: string;
            comment: string;
            default: boolean;
        };
        cooldownTime: {
            type: string;
            comment: string;
            default: number;
        };
        disableChatCooldown: {
            type: string;
            comment: string;
            default: boolean;
        };
        noThreadKeyword: {
            type: string;
            comment: string;
            default: string;
        };
        deleteEmptyThreads: {
            type: string;
            comment: string;
            default: boolean;
        };
        threadCommands: {
            type: string;
            comment: string;
            default: boolean;
        };
        autothreadSubscribers: {
            type: string;
            comment: string;
            default: never[];
        };
    };
    private cooldowns;
    private cooldownCancelFuncs;
    private _threadUpdateHandler?;
    constructor(bot: Bot);
    autothread_command(event: DiscordCommandEvent): AsyncGenerator<never, ReplyUnimportant | "Autothread disabled." | "Autothread enabled." | undefined, unknown>;
    archiveThreads(event: DiscordCommandEvent): AsyncGenerator<never, void, unknown>;
    getThreadTitleCommand(event: DiscordCommandEvent): AsyncGenerator<string, void, unknown>;
    messageHandler(event: DiscordMessageEvent, eventControls: EventControls): AsyncGenerator<Send, void, unknown>;
    private _onThreadUpdate;
    private addCooldownDoneTimeout;
    private extractTitleFromMessage;
    private replaceURLsWithTitles;
    private getWebsiteTitle;
    private parseOrRemoveHTMLEntities;
    private unmapRedirects;
    private isWhitelistedWebsite;
    private removeParentheses;
    private unMentionify;
    private _isUserMessage;
    private isCool;
    private setCooldown;
    _start(): void;
    _stop(): Promise<void>;
}
