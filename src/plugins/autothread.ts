import Bot from "../main/bot/bot/bot.js";
import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";

import BotPlugin from "../main/bot/plugin/plugin.js";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent.js";
import { TextChannel, ThreadChannel } from "discord.js";
import ellipsisize from "../main/utils/str/ellipsisize.js";
import Logger from "../main/utils/logger.js";
import getSnowflakeNum from "../main/utils/getSnowflakeNum.js";
import { EventControls } from "../main/bot/events/eventHandlers.js";
import fakeMessage from "../main/utils/fakeMessage.js";
import mention from "../main/utils/str/mention.js";
import https from "https";
import { stopWords } from "./autothread_assets/stopWords.js";
import websites from "./autothread_assets/websiteWhitelist.js";
import { IncomingMessage } from "http";
import wait from "../main/utils/async/wait.js";
import { ReplyUnimportant } from "../main/bot/actions/actions.js";
import removeFormattingChars from "../main/utils/str/removeFormattingChars.js";

const WEBSITE_TITLE_GET_TIMEOUT = 1000;

/**
 * Autothread plugin; automatically makes threads
 */
export default class AutoThread extends BotPlugin {
    public userConfigSchema = {
        enabled: {
            type: "boolean",
            comment: "Automatically create threads and other side effects?",
            default: false
        },
        cooldownTime: {
            type: "number",
            comment: "How many seconds until another thread is created?",
            default: 30
        },
        disableChatCooldown: {
            type: "boolean",
            comment: "Automatically disable chatting while on cooldown?",
            default: true
        },
        noThreadKeyword: {
            type: "string",
            comment: "Will not make a thread if this keyword is found. Empty string to disable",
            default: "[no thread]"
        },
        deleteEmptyThreads: {
            type: "boolean",
            comment: "Deletes automatic threads if they're automatically archived with no messages.",
            default: false
        },
        threadCommands: {
            type: "boolean",
            comment: "Should run commands in a new thread?",
            default: true
        },
        autothreadSubscribers: {
            type: "object",
            comment: "The userId of people to add to autothreads",
            default: []
        }
    };

    private cooldowns: Map<string, number> = new Map();
    private cooldownCancelFuncs: Map<string, Function> = new Map();
    private _threadUpdateHandler?: (oldThread: ThreadChannel, newThread: ThreadChannel) => void;

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "autothread";
    }

    public async *autothread_command(event: DiscordCommandEvent) {
        const argsCleaned = event.arguments.trim().toLowerCase();

        // autothread cool subcommand -- cancels the cooldown
        if (argsCleaned) {
            if (argsCleaned === "cool") {
                const cancelFunc = this.cooldownCancelFuncs.get(event.channelId);
                if (cancelFunc) { await cancelFunc(); }
                return;
            } else {
                return new ReplyUnimportant(`Unknown subcommand. See \`${event.precommandName}help autothread\` for usage.`);
            }
        }

        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel || channel.isThread()) {
            return new ReplyUnimportant("Cannot create threads inside threads.");
        }

        const isEnabled = await this.config.getInChannel(event.channelId, "enabled");

        if (isEnabled) {
            this.config.setInChannel(event.channelId, "enabled", false);
            return "Autothread disabled.";
        } else {
            this.config.setInChannel(event.channelId, "enabled", true);
            return "Autothread enabled.";
        }
    }

    public async *archiveThreads(event: DiscordCommandEvent) {
        const channel = await this.bot.client.getChannel(event.channelId);
        if (channel && channel.isText() && 'threads' in channel) {
            channel.threads.cache.forEach(thread => {
                if (!thread.archived) {
                    thread.setArchived();
                }
            })
        }
    }

    public async *getThreadTitleCommand(event: DiscordCommandEvent) {
        yield "`" + (await this.extractTitleFromMessage(event.arguments)).replace("`", "") + "`";
    }

    public async messageHandler(event: DiscordMessageEvent, eventControls: EventControls) {
        const config = await this.config.getAllUserSettingsInChannel(event.channelId);
        if (!config.get("enabled")) { return; }
        if (!(await this._isUserMessage(event))) { return; }

        const noThreadKeyword = config.get("noThreadKeyword");
        if (noThreadKeyword && event.message.includes(noThreadKeyword)) { return; }
        const channel = await this.bot.client.getChannel(event.channelId) as TextChannel;
        if (!channel || channel.isThread()) { return; }

        if (!this.isCool(event.channelId)) { return; }

        // if is command
        if (event.precommandName) {
            // cancel if don't thread commands
            if (!config.get("threadCommands")) { return; }

            // cancel if is `!autothread`
            if (
                event.message.slice(event.precommandName.name.length).toLowerCase().startsWith("autothread")
            ) { return; }
        }

        // create thread
        const thread = await channel.threads.create({
            name: ellipsisize(await this.extractTitleFromMessage(event.message) || "Untitled", 100),
            startMessage: event.messageId
        });

        // sets cooldowns
        const cooldownTime = config.get("cooldownTime") * 1000;
        const disableChatCooldown = config.get("disableChatCooldown");
        this.setCooldown(event.channelId, cooldownTime);

        if (disableChatCooldown) {
            // prevent people from sending messages while on cooldown
            channel.permissionOverwrites.create(channel.guild.roles.everyone, { SEND_MESSAGES: false });
            this.addCooldownDoneTimeout(
                () => channel.permissionOverwrites.delete(channel.guild.roles.everyone),
                channel.id,
                cooldownTime
            )
        }

        // if the bot responds to the message (ex. command), respond in thread
        eventControls.preventSystemNext();
        eventControls.stopPropagation();

        this.bot.rawEventAdapter.onMessage(fakeMessage({
            author: (await this.bot.client.getUser(event.userId))!,
            channel: thread,
            content: event.message,
            guild: (await this.bot.client.getServer(event.serverId))!,
            id: event.messageId
        }));

        // add thread subscribers
        const subscribers = config.get("autothreadSubscribers");
        if (Array.isArray(subscribers) && subscribers.length > 0) {
            const subscribersToNotice = subscribers.filter(id => id !== event.userId);
            if (subscribersToNotice.length > 0) {
                const message = await thread.send("(Adding subscribers...)");
                const messageText =
                    thread.name + ": subscribed\n" +
                    subscribersToNotice
                        .map(id => mention(id))
                        .join(" ");
                await message.edit(messageText);
                await message.delete();
            }
        }
    }

    private async _onThreadUpdate(oldState: ThreadChannel, newState: ThreadChannel) {
        const config = await this.config.getAllUserSettingsInChannel(newState.id);
        if (!config.get("deleteEmptyThreads")) { return; } // ignore; don't delete threads
        if (oldState.ownerId !== this.bot.client.id) { return; } // ignore; thread not made by bot (UNTESTED)
        if (oldState.archived || !newState.archived) { return; } // ignore; not change to archive
        if (oldState.archiveTimestamp === null || oldState.autoArchiveDuration === null) { return; } // lack of information

        const autoArchiveTimestamp = oldState.archiveTimestamp + (oldState.autoArchiveDuration as number) * 60e3;
        if (Date.now() < autoArchiveTimestamp) { return; } // ignore; manual archive

        let messageCacheSize = newState.messages.cache.size;
        if (messageCacheSize === 1) {
            const firstMessage = newState.messages.cache.at(0);
            if (firstMessage && firstMessage.type === "THREAD_STARTER_MESSAGE") {
                messageCacheSize -= 1; // first message is not message
            }
        }

        if (messageCacheSize > 0 ||
            newState.messageCount === null ||
            newState.messageCount > 0) {
            return;
        } // ignore; contains or has chance to contain messages

        await newState.delete();
    }

    private addCooldownDoneTimeout(func: Function, channelId: string, cooldownTime: number) {
        const timeout = setTimeout(() => {
            func();
        }, cooldownTime);

        const cancelFunc = async () => {
            clearTimeout(timeout);
            await func();
            this.cooldownCancelFuncs.delete(channelId);
        };

        this.cooldownCancelFuncs.set(channelId, cancelFunc);
    }

    private async extractTitleFromMessage(message: string) {
        const firstLine = message
            .replace(/\|\|.+?\|\|/g, "(...)") // remove spoiler text
            .replace(/<:([a-z_]+):\d{7,}>/gi, (_, emojiName) => emojiName)
            .split("\n").find(e => e.trim()) || "" // get first line
        const cleanFirstLine = removeFormattingChars(firstLine);

        // back out of extraction -- no first line
        if (!cleanFirstLine) { return message; }

        const firstLineURLReplaced = removeFormattingChars(
            await this.replaceURLsWithTitles(firstLine)
        );

        // already short enough -- no need for further extraction
        if (firstLineURLReplaced.length < 25) { return firstLineURLReplaced; }

        const extractedTitle = this.removeParentheses( // remove text (in parentheses)
            (await this.unMentionify(firstLineURLReplaced)) // swap <@###> -> @username
        )
            .split(/\s+/)
            .filter(e => !stopWords.has( // remove stop words
                e.replace(/\W/g, "").toLowerCase()
            )).join(" ");

        // extracted nothing, back out
        if (extractedTitle.length === 0) { return firstLine; }
        return extractedTitle;
    }

    private async replaceURLsWithTitles(text: string) {
        const textWithUrl = new TextWithURL(text);

        const urls = textWithUrl.getURLs();

        const promises = [];
        for (const url of urls) {
            promises.push(
                this.getWebsiteTitle(url)
                    .then(title => {
                        if (title) {
                            textWithUrl.replace(url, title.trim());
                        }
                    })
            );
        }

        await Promise.all(promises);

        return textWithUrl.toString();
    }

    private async getWebsiteTitle(url: string): Promise<string | undefined> {
        const that = this;
        const unmappedUrl = this.unmapRedirects(url);
        const urlParsed = new URL(unmappedUrl);
        if (urlParsed.protocol !== 'https:') { return; }
        if (!this.isWhitelistedWebsite(urlParsed)) { return; }

        const promise = new Promise<string>(resolve => {
            let text = "";
            let gotTitle = false;

            function checkTitle() {
                const title = text.match(/<title>(.+)<\/title>/);
                if (title) {
                    resolve(that.parseOrRemoveHTMLEntities(title[1]));
                    gotTitle = true;
                }
            }

            function end(response: IncomingMessage) {
                checkTitle();
                response.destroy();
                if (!gotTitle) { resolve(""); gotTitle = true; }
            }

            let remainingRedirects = 5; // start with 5 redirects

            function makeHttpRequest(url: string) {
                const request = https.get(url, response => {
                    console.log(response.statusCode);
                    if (response.statusCode !== 200) {
                        if (response.statusCode && [301, 302, 303, 307, 308].includes(response.statusCode) &&
                            response.headers.location && that.isWhitelistedWebsite(new URL(response.headers.location)) &&
                            remainingRedirects > 0) {
                            remainingRedirects--;
                            response.destroy();
                            makeHttpRequest(response.headers.location);
                            return;
                        }
                        resolve("");
                        return;
                    }

                    response.on("data", chunk => {
                        text += chunk.toString();
                        checkTitle();
                        if (gotTitle) { response.destroy(); }
                    });
                    response.on("end", () => end(response));
                    response.on("error", () => end(response));
                    response.on("pause", () => end(response));
                    response.on("close", () => end(response));
                    wait(WEBSITE_TITLE_GET_TIMEOUT).then(() => end(response));
                });
                request.on("error", error => Logger.log(error));
            }

            makeHttpRequest(unmappedUrl);
        });
        promise.catch(err => { Logger.log(err); });

        return promise;
    }

    private parseOrRemoveHTMLEntities(str: string) {
        return str
            .replace(/&#(\d+?);/g, substr => String.fromCharCode(parseInt(substr.slice(2, -1))))
            .replace(/&(\w+?);/g, "");
    }

    private unmapRedirects(url: string): string {
        const urlParsed = new URL(url);
        const redirectFunc = websites.redirects[urlParsed.hostname];
        if (redirectFunc) {
            return redirectFunc(url);
        } else {
            return url;
        }
    }

    private isWhitelistedWebsite(url: URL): boolean {
        const parts = url.hostname.split(".");
        for (let i = parts.length; i >= 2; i--) {
            if (websites.whitelist.has(parts.slice(-i).join("."))) {
                return true;
            }
        }
        return false;
    }

    private removeParentheses(str: string): string {
        let result = "";
        let depth = 0;
        let start = 0;
        for (let i = 0; i < str.length; i++) {
            if (str[i] === "(") {
                if (depth === 0) {
                    result += str.slice(start, i);
                }
                depth += 1;
            } else if (str[i] === ")") {
                depth -= 1;
                if (depth === 0) {
                    start = i + 1;
                } else if (depth < 0) {
                    depth = 0;
                }
            }
        }
        if (depth === 0) {
            result += str.slice(start);
        }
        return result;
    }

    private async unMentionify(str: string): Promise<string> {
        const regex = /<@[!@&]?\d+>/g;
        let strParts = [];
        let lastIndex = 0;

        for (let match; match = regex.exec(str);) {
            const snowflake = getSnowflakeNum(match[0]);
            if (!snowflake) { continue; }
            const user = await this.bot.client.getUser(snowflake);
            if (!user) { continue; }

            strParts.push(str.slice(lastIndex, match.index));
            strParts.push("@" + user.username);
            lastIndex = match.index + match[0].length;
        }

        return strParts.join("") + str.slice(lastIndex);
    }

    private async _isUserMessage(event: DiscordMessageEvent): Promise<boolean> {
        const user = await this.bot.client.getUser(event.userId);
        return Boolean(
            user && !user.bot
        );
    }

    private isCool(channelId: string): boolean {
        const cooldown = this.cooldowns.get(channelId);
        return !cooldown || cooldown <= Date.now();
    }

    private setCooldown(channelId: string, time: number) {
        this.cooldowns.set(channelId, Date.now() + time);
    }

    _start(): void {
        this.bot.client.client.on("threadUpdate",
            this._threadUpdateHandler = (oldState: ThreadChannel, newState: ThreadChannel) => {
                this._onThreadUpdate(oldState, newState)
                    .catch(err => Logger.error(err));
            });

        this._registerDefaultCommand("autothread", this.autothread_command, {
            group: "Communication",
            help: {
                description: "Enables autothread (making threads) for the channel.",
                overloads: [{
                    "none": "Toggles autothread on the channel"
                }, {
                    "cool": "Appending 'cool' will re-enable chat if the channel is on disableChatCooldown (see config)"
                }],
                examples: [
                    ["autothread", "Toggles autothread on the channel"],
                    ["autothread cool", "If the channel is on disableChatCooldown, will re-enable chat (finishing the cooldown)"]
                ]
            },
            noDM: true
        });

        this._registerDefaultCommand("archive threads", this.archiveThreads, {
            group: "Communication",
            help: {
                description: "Archives all active threads in the channel."
            },
            noDM: true,
            requiredDiscordPermission: "MANAGE_THREADS"
        });


        this._registerDefaultCommand("get thread title", this.getThreadTitleCommand, {
            group: "Testing",
            help: {
                description: "Generates the title of a thread started by a given message."
            }
        });

        this.bot.events.message.addHighPriorityHandler(this.messageHandler.bind(this));
    }

    async _stop() {
        if (this._threadUpdateHandler) {
            this.bot.client.client.off("threadUpdate", this._threadUpdateHandler);
        }

        const cooldownCancelFuncs = Array.from(this.cooldownCancelFuncs.values());
        const promises = [];
        for (const cooldownCancelFunc of cooldownCancelFuncs) {
            promises.push(cooldownCancelFunc());
        }
        await Promise.all(promises);
    }
}


class TextWithURL {
    private parts: (string | { original: string, replacement: string })[];

    constructor(text: string) {
        this.parts = [];

        const urlRegex = /https?:\/\/[^\s]+/g;
        let lastIndex = 0;
        for (let match; match = urlRegex.exec(text);) {
            this.parts.push(text.slice(lastIndex, match.index));
            this.parts.push({
                original: match[0],
                replacement: new URL(match[0]).hostname || match[0]
            });
            lastIndex = match.index + match[0].length;
        }
        this.parts.push(text.slice(lastIndex));
    }

    getURLs() {
        const urls = [];
        for (const part of this.parts) {
            if (typeof part === "object") {
                urls.push(part.original);
            }
        }
        return urls;
    }

    replace(original: string, replacement: string) {
        for (const part of this.parts) {
            if (typeof part === "object" && part.original === original) {
                part.replacement = replacement;
            }
        }
    }

    toString() {
        let str = "";
        for (const part of this.parts) {
            if (typeof part === "string") {
                str += part;
            } else {
                str += part.replacement;
            }
        }
        return str;
    }
}
