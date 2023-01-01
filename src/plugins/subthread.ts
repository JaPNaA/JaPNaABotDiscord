import { ThreadChannel, Interaction, TextChannel, MessageActionRow, MessageButton, Message } from "discord.js";
import { MessageButtonStyles } from "discord.js/typings/enums";
import { ReplySoft, ReplyThreadSoft, ReplyUnimportant, Send } from "../main/bot/actions/actions";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin";
import Logger from "../main/utils/logger";
import ellipsisize from "../main/utils/str/ellipsisize";
import mention from "../main/utils/str/mention";

/**
 * Subthread plugin, a workaround to get threads inside other threads
 */
class Subthread extends BotPlugin {
    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "subthread";
    }

    public async *subthread(event: DiscordCommandEvent) {
        let threadTitle = event.arguments.trim();
        let lastMessage;

        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel?.isText()) { return new ReplyUnimportant("You must run this command in a text channel"); }

        if (!threadTitle) {
            // automatic title (no title provided)
            if (!channel.lastMessage) { return new ReplyUnimportant("Must provide a thread title because no last message was found in this channel."); }
            if (channel.lastMessage.hasThread) { return new ReplyUnimportant("Must provide a thread title to create new thread since the last message already has a thread"); }
            threadTitle = channel.lastMessage.content;
            lastMessage = channel.lastMessage;
        }

        if (!channel.isThread()) {
            return new ReplyThreadSoft(ellipsisize(threadTitle, 100) || "Untitled", {
                startMessage: lastMessage
            });
        }

        const parentChannel = channel.parent;
        if (!(parentChannel instanceof TextChannel)) {
            throw new Error("A parent text channel is required to create a thread.");
        }
        const thread = await parentChannel.threads.create({
            name: ellipsisize((threadTitle || "Untitled") + ` (in ${channel.name})`, 100),
            type: "GUILD_PRIVATE_THREAD",
        });

        const threadFirstMessageAction = SubthreadFirstMessage.generate(thread, channel, lastMessage);
        yield threadFirstMessageAction;
        const threadFirstMessage = threadFirstMessageAction.getMessage();

        const initalMembers = [event.userId];
        if (lastMessage && event.userId !== lastMessage.author.id) { // second condition avoids redundant mention
            initalMembers.push(lastMessage.author.id);
        }
        await SubthreadFirstMessage.editToMention(threadFirstMessage, initalMembers);

        return new ReplySoft({
            content: `**Subthread** --> <#${thread.id}>`,
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setLabel("Gain access")
                        .setCustomId(`threadaccessgive:${thread.id}:${threadFirstMessage.id}`)
                        .setStyle(MessageButtonStyles.PRIMARY)
                )
            ]
        });
    }

    private async interactionHandler(interaction: Interaction) {
        try {
            if (!interaction.isButton()) { return; }
            if (interaction.customId.startsWith("threadaccessgive:")) {
                const [command, threadId, firstMessageId] = interaction.customId.split(":");
                const thread = await this.bot.client.getChannel(threadId);
                if (thread instanceof ThreadChannel) {
                    const firstMessage = await thread.messages.fetch(firstMessageId);
                    if (firstMessage) {
                        await SubthreadFirstMessage.editToMention(firstMessage, [interaction.user.id]);
                    }
                }

                try {
                    await interaction.update({});
                } catch (err) {
                    Logger.warn(err);
                }
            }
        } catch (err) {
            Logger.error(err);
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
    public static readonly MENTION_AREA = SubthreadFirstMessage.generateMentionLine();
    private static readonly MENTION_AREA_REGEX = /\n\|\|\(mention invitation line( <@.+?>\s?)*\)\|\|/;

    private static generateMentionLine(ids?: string[]) {
        if (ids?.length) {
            return "\n||(mention invitation line " + ids.map(id => mention(id)).join(" ") + " )||";
        } else {
            return "\n||(mention invitation line)||";
        }
    }

    static generate(newThread: ThreadChannel, parentThread: ThreadChannel, lastMessage?: Message) {
        return lastMessage ?
            new Send(newThread.id, `Initial message: https://discord.com/channels/${newThread.guildId || "@me"}/${lastMessage.channelId}/${lastMessage.id}` + SubthreadFirstMessage.MENTION_AREA)
            :
            new Send(newThread.id, `Parent thread: <#${parentThread.id}>` +
                SubthreadFirstMessage.MENTION_AREA);
    }

    static async editToMention(message: Message, ids: string[]) {
        if (message.partial) { await message.fetch(); }
        let wasThreadUnarchived = false;
        if (message.channel instanceof ThreadChannel && message.channel.archived && message.channel.unarchivable) {
            wasThreadUnarchived = true;
            await message.channel.setArchived(false);
        }
        if (!message.editable) { return; }

        let text;
        if (SubthreadFirstMessage.MENTION_AREA_REGEX.test(message.content)) {
            text = message.content.replace(SubthreadFirstMessage.MENTION_AREA_REGEX, this.generateMentionLine(ids));
        } else {
            text = message.content + this.generateMentionLine(ids);
        }

        await message.edit(text);

        if (wasThreadUnarchived) {
            await (message.channel as ThreadChannel).setArchived(true);
        }
    }
}

export default Subthread;