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
/**
 * Subthread plugin, a workaround to get threads inside other threads
 */
class Subthread extends plugin_1.default {
    constructor(bot) {
        super(bot);
        this.pluginName = "subthread";
    }
    async *subthread(event) {
        let threadTitle = event.arguments.trim();
        let lastMessage;
        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel?.isText()) {
            return new actions_1.ReplyUnimportant("You must run this command in a text channel");
        }
        if (!threadTitle) {
            // automatic title (no title provided)
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
        if (!channel.isThread()) {
            return new actions_1.ReplyThreadSoft(threadTitle, {
                startMessage: lastMessage
            });
        }
        const parentChannel = channel.parent;
        if (!(parentChannel instanceof discord_js_1.TextChannel)) {
            throw new Error("A parent text channel is required to create a thread.");
        }
        const thread = await parentChannel.threads.create({
            name: (0, ellipsisize_1.default)(threadTitle + ` (in ${channel.name})`, 100),
            type: "GUILD_PRIVATE_THREAD",
        });
        const threadFirstMessageAction = SubthreadFirstMessage.generate(thread, channel, lastMessage || channel.lastMessage);
        yield threadFirstMessageAction;
        const threadFirstMessage = threadFirstMessageAction.getMessage();
        const initalMembers = [event.userId];
        if (lastMessage && event.userId !== lastMessage.author.id) { // second condition avoids redundant mention
            initalMembers.push(lastMessage.author.id);
        }
        await SubthreadFirstMessage.editToMention(threadFirstMessage, initalMembers);
        return new actions_1.ReplySoft({
            content: "**Subthread** " + (lastMessage ? "from last message" : `_${threadTitle}_`) + `\n--> <#${thread.id}>`,
            components: [
                new discord_js_1.MessageActionRow().addComponents(new discord_js_1.MessageButton()
                    .setLabel("Gain access")
                    .setCustomId(`threadaccessgive:${thread.id}:${threadFirstMessage.id}`)
                    .setStyle(1 /* MessageButtonStyles.PRIMARY */))
            ]
        });
    }
    async interactionHandler(interaction) {
        try {
            if (!interaction.isButton()) {
                return;
            }
            if (interaction.customId.startsWith("threadaccessgive:")) {
                const [command, threadId, firstMessageId] = interaction.customId.split(":");
                const thread = await this.bot.client.getChannel(threadId);
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
        this._registerDefaultCommand("subthread", this.subthread);
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
            message = `\nJump: https://discord.com/channels/${newThread.guildId || "@me"}/${lastMessage.channelId}/${lastMessage.id} (in <#${parentThread.id}>)`;
        }
        else {
            message = `Parent thread: <#${parentThread.id}>`;
        }
        message += SubthreadFirstMessage.MENTION_AREA;
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
