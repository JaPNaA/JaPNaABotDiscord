"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const actions_1 = require("../main/bot/actions/actions");
const plugin_1 = __importDefault(require("../main/bot/plugin/plugin"));
const logger_1 = __importDefault(require("../main/utils/logger"));
const ellipsisize_1 = __importDefault(require("../main/utils/str/ellipsisize"));
const mention_1 = __importDefault(require("../main/utils/str/mention"));
const removeFormattingChars_1 = __importDefault(require("../main/utils/str/removeFormattingChars"));
const commandArguments_1 = __importDefault(require("../main/bot/command/commandArguments"));
const getSnowflakeNum_1 = __importDefault(require("../main/utils/getSnowflakeNum"));
/**
 * Subthread plugin, a workaround to get threads inside other threads
 */
class Subthread extends plugin_1.default {
    userConfigSchema = {
        "subthreadChannel": {
            type: "string",
            comment: "The channel to create subthreads in.",
            default: ""
        },
        "channelSelection": {
            type: "string",
            comment: "How to choose channels to create subthreads in. Set to 'parent' to always use the current parent channel. Set to 'parentThenSpecified' to use the current parent if possible, otherwise uses the subthreadChannel. Set to 'specified' to always use the specified subthreadChannel.",
            default: "parentThenSpecified"
        },
        "usePrivateThreads": {
            type: "boolean",
            comment: "Should mark subthreads as private? Setting threads private prevents Discord from sending a thread creation announcement. Setting threads public removes the need for the 'Gain Access' button. Note that when creating a subthread across channels, if any channel uses private threads, a private thread will be made.",
            default: true
        }
    };
    constructor(bot) {
        super(bot);
        this.pluginName = "subthread";
    }
    async *subthread(event) {
        const args = new commandArguments_1.default(event.arguments).parse({
            overloads: [["name", "parentChannel"], ["parentChannel", "name"], ["parentChannel"], ["name"]],
            allowMultifinal: true,
            check: {
                parentChannel: x => Boolean(x && !x.match(/[\sa-z]/) && (0, getSnowflakeNum_1.default)(x))
            }
        });
        const parentChannelArg = args.get("parentChannel");
        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel) {
            throw new Error("Channel not found");
        }
        let threadTitle = args.get("name")?.trim();
        let lastMessage;
        // choose parent channel
        let parentChannel;
        if (parentChannelArg) {
            const snowflake = (0, getSnowflakeNum_1.default)(parentChannelArg);
            if (!snowflake) {
                throw new Error("No snowflake provided in argument");
            }
            parentChannel = await this.bot.client.getChannel(snowflake);
        }
        else {
            parentChannel = await this.chooseSubthreadChannel(channel);
        }
        if (!parentChannel) {
            throw new Error("Parent channel not found");
        }
        if (!(parentChannel instanceof discord_js_1.TextChannel)) {
            return new actions_1.ReplyUnimportant("Cannot make subthread: the channel specified is not a (normal) text channel");
        }
        // determine title
        if (!threadTitle) {
            // automatic title (no title provided)
            if (!('lastMessage' in channel)) {
                return new actions_1.ReplyUnimportant("Cannot get last message in this channel.");
            }
            if (!channel.lastMessage) {
                return new actions_1.ReplyUnimportant("Must provide a thread title because no last message was found in this channel.");
            }
            if (channel.lastMessage.hasThread) {
                return new actions_1.ReplyUnimportant("Must provide a thread title to create new thread since the last message already has a thread");
            }
            threadTitle = channel.lastMessage.content;
            lastMessage = channel.lastMessage;
        }
        threadTitle = (0, ellipsisize_1.default)((0, removeFormattingChars_1.default)(threadTitle), 100) || "Untitled";
        // check if should be private
        const isUsePrivateThreads = await this.config.getInChannel(channel.id, "usePrivateThreads") ||
            await this.config.getInChannel(parentChannel.id, "usePrivateThreads");
        // check permissions
        if (!(await this.bot.permissions.getPermissions_channel(event.userId, event.serverId, parentChannel.id))
            .hasDiscord(isUsePrivateThreads ? "CreatePrivateThreads" : "CreatePublicThreads")) {
            return new actions_1.ReplyUnimportant("You do not have permission to make " +
                (isUsePrivateThreads ? "private" : "public") +
                " threads in <#" + parentChannel.id + ">");
        }
        // can create normal thread instead
        if (parentChannel === channel) {
            return new actions_1.ReplyThreadSoft(threadTitle, {
                startMessage: lastMessage,
            });
        }
        let thread = await parentChannel.threads.create({
            name: (0, ellipsisize_1.default)(threadTitle + ('name' in channel ? ` (in ${channel.name})` : ""), 100),
            type: isUsePrivateThreads ? discord_js_1.ChannelType.PrivateThread : discord_js_1.ChannelType.PublicThread
        });
        const threadFirstMessageAction = SubthreadFirstMessage.generate(thread, channel, lastMessage || ('lastMessage' in channel ? channel.lastMessage : undefined));
        yield threadFirstMessageAction;
        const threadFirstMessage = threadFirstMessageAction.getMessage();
        const initalMembers = [event.userId];
        if (lastMessage && event.userId !== lastMessage.author.id) { // second condition avoids redundant mention
            initalMembers.push(lastMessage.author.id);
        }
        if (isUsePrivateThreads) {
            await SubthreadFirstMessage.editToMention(threadFirstMessage, initalMembers);
        }
        return new actions_1.ReplySoft({
            content: "**Subthread** " + (lastMessage ? "from last message" : `_${threadTitle}_`) + `\n--> <#${thread.id}>`,
            // @ts-ignore -- This fails typechecks, but is how they do it in the discord.js guide
            components: isUsePrivateThreads ? [
                new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
                    .setLabel("Gain access")
                    .setCustomId(`threadaccessgive:${thread.id}:${threadFirstMessage.id}`)
                    .setStyle(discord_js_1.ButtonStyle.Primary))
            ] : undefined
        });
    }
    async chooseSubthreadChannel(channel) {
        const config = await this.config.getAllUserSettingsInChannel(channel.id);
        const subthreadChannelSelectionMethod = config.get("channelSelection");
        const subthreadChannelId = config.get("subthreadChannel");
        switch (subthreadChannelSelectionMethod) {
            default:
            case "parent":
            case "parentThenSpecified":
                if (this.canCreateThreadIn(channel)) {
                    return channel;
                }
                if ('parent' in channel && this.canCreateThreadIn(channel.parent)) {
                    return channel.parent;
                }
                if (subthreadChannelSelectionMethod == "parent") {
                    throw new Error("Cannot create subthread here.");
                }
                if (!subthreadChannelId) {
                    throw new Error("Cannot create subthread here. No subthreadChannel configured to fallback to.");
                }
            case "specified":
                const defaultChannel = await this.bot.client.getChannel(subthreadChannelId);
                if (!this.canCreateThreadIn(defaultChannel)) {
                    throw new Error("Cannot create thread in (or cannot find) configured subthreadChannel.");
                }
                return defaultChannel;
        }
    }
    canCreateThreadIn(channel) {
        return channel instanceof discord_js_1.TextChannel;
    }
    async interactionHandler(interaction) {
        try {
            if (!interaction.isButton()) {
                return;
            }
            if (interaction.customId.startsWith("threadaccessgive:")) {
                const [command, threadId, firstMessageId] = interaction.customId.split(":");
                let thread;
                try {
                    thread = await this.bot.client.getChannel(threadId);
                    console.log(thread);
                }
                catch (err) {
                    await interaction.update({
                        components: [],
                        content: "_(Subthread deleted)_"
                    });
                    await interaction.followUp({
                        content: "This subthread no longer exists. :/",
                        ephemeral: true
                    });
                    return;
                }
                if (thread instanceof discord_js_1.ThreadChannel) {
                    const firstMessage = await thread.messages.fetch(firstMessageId);
                    if (firstMessage) {
                        await SubthreadFirstMessage.editToMention(firstMessage, [interaction.user.id]);
                    }
                }
                try {
                    await interaction.update({});
                }
                catch (err) {
                    logger_1.default.warn(err);
                }
            }
        }
        catch (err) {
            logger_1.default.error(err);
        }
    }
    _start() {
        // Handling ReplyThreadHard
        this.interactionHandler = this.interactionHandler.bind(this);
        this.bot.client.client.on("interactionCreate", this.interactionHandler);
        this._registerDefaultCommand("subthread", this.subthread, {
            help: {
                description: "Creates a subthread",
                overloads: [{ "title": "Optional. Specifies a title for the subthread" }],
                examples: [
                    ["subthread", "Creates a subthread from the message above"],
                    ["subthread my thread", "Creates a subthread titled 'my thread'"]
                ]
            },
            group: "Communication",
            noDM: true
        });
    }
    _stop() {
        this.bot.client.client.off("interactionCreate", this.interactionHandler);
    }
}
class SubthreadFirstMessage {
    static MENTION_AREA = SubthreadFirstMessage.generateMentionLine();
    static MENTION_AREA_REGEX = /\n\|\|\(mention invitation line( <@.+?>\s?)*\)\|\|/;
    static generateMentionLine(ids) {
        if (ids?.length) {
            return "\n||(mention invitation line " + ids.map(id => (0, mention_1.default)(id)).join(" ") + " )||";
        }
        else {
            return "\n||(mention invitation line)||";
        }
    }
    static generate(newThread, parentThread, lastMessage) {
        let message;
        if (lastMessage) {
            message = `\nJump: https://discord.com/channels/${newThread.guildId || "@me"}/${lastMessage.channelId}/${lastMessage.id}`;
        }
        else {
            message = `Parent thread: <#${parentThread.id}>`;
        }
        return new actions_1.Send(newThread.id, message);
    }
    static async editToMention(message, ids) {
        const promises = [];
        if (message.partial) {
            promises.push(message.fetch());
        }
        let wasThreadUnarchived = false;
        let wasThreadLocked = false;
        if (message.channel instanceof discord_js_1.ThreadChannel) {
            if (message.channel.archived && message.channel.unarchivable) {
                wasThreadUnarchived = true;
                promises.push(message.channel.setArchived(false));
            }
            if (message.channel.locked) {
                wasThreadLocked = true;
                promises.push(message.channel.setLocked(false));
            }
        }
        await Promise.all(promises);
        promises.length = 0;
        if (message.editable) {
            let text;
            if (SubthreadFirstMessage.MENTION_AREA_REGEX.test(message.content)) {
                text = message.content.replace(SubthreadFirstMessage.MENTION_AREA_REGEX, this.generateMentionLine(ids));
            }
            else {
                text = message.content + this.generateMentionLine(ids);
            }
            await message.edit(text);
        }
        if (wasThreadUnarchived) {
            promises.push(message.channel.setArchived(true));
        }
        if (wasThreadLocked) {
            promises.push(message.channel.setLocked(true));
        }
        await Promise.all(promises);
    }
}
exports.default = Subthread;
