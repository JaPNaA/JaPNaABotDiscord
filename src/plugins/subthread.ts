import { ThreadChannel, Interaction, TextChannel, Message, DMChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, Channel, ChannelType, EmbedBuilder } from "discord.js";
import { ReplySoft, ReplyThreadSoft, ReplyUnimportant, Send } from "../main/bot/actions/actions";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin";
import Logger from "../main/utils/logger";
import ellipsisize from "../main/utils/str/ellipsisize";
import mention from "../main/utils/str/mention";
import removeFormattingChars from "../main/utils/str/removeFormattingChars";

/**
 * Subthread plugin, a workaround to get threads inside other threads
 */
class Subthread extends BotPlugin {
    public userConfigSchema = {
        "subthreadChannel": {
            type: "string",
            comment: "The channel to create subthreads in.",
            default: ""
        },
        "channelSelection": {
            type: "string",
            comment: "How to choose channels to create subthreads in. Set to 'parent' to always use the current parent channel. Set to 'parentThenSpecified' to use the current parent if possible, otherwise uses the subthreadChannel. Set to 'specified' to always use the specified subthreadChannel.",
            default: "parentThenSpecified"
        }
    };

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "subthread";
    }

    public async *subthread(event: DiscordCommandEvent) {
        let threadTitle = event.arguments.trim();
        let lastMessage;

        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel?.isTextBased()) { return new ReplyUnimportant("You must run this command in a text channel"); }
        if (channel instanceof DMChannel) { return new ReplyUnimportant("Cannot use this command in DMs"); }

        if (!threadTitle) {
            // automatic title (no title provided)
            if (!('lastMessage' in channel)) { return new ReplyUnimportant("Cannot get last message in this channel."); }
            if (!channel.lastMessage) { return new ReplyUnimportant("Must provide a thread title because no last message was found in this channel."); }
            if (channel.lastMessage.hasThread) { return new ReplyUnimportant("Must provide a thread title to create new thread since the last message already has a thread"); }
            threadTitle = channel.lastMessage.content;
            lastMessage = channel.lastMessage;
        }

        threadTitle = ellipsisize(removeFormattingChars(threadTitle), 100) || "Untitled";

        if (this.canCreatePrivateThreadIn(channel)) { // can create normal thread
            return new ReplyThreadSoft(threadTitle, {
                startMessage: lastMessage
            });
        }

        const parentChannel = await this.chooseSubthreadChannel(channel);

        let thread = await parentChannel.threads.create({
            name: ellipsisize(threadTitle + ('name' in channel ? ` (in ${channel.name})` : ""), 100),
            type: ChannelType.PrivateThread
        });

        const threadFirstMessageAction = SubthreadFirstMessage.generate(thread, channel, lastMessage || ('lastMessage' in channel ? channel.lastMessage : undefined));
        yield threadFirstMessageAction;
        const threadFirstMessage = threadFirstMessageAction.getMessage();

        const initalMembers = [event.userId];
        if (lastMessage && event.userId !== lastMessage.author.id) { // second condition avoids redundant mention
            initalMembers.push(lastMessage.author.id);
        }
        await SubthreadFirstMessage.editToMention(threadFirstMessage, initalMembers);

        return new ReplySoft({
            content: "**Subthread** " + (lastMessage ? "from last message" : `_${threadTitle}_`) + `\n--> <#${thread.id}>`,
            components: [
                // @ts-ignore -- This fails typechecks, but is how they do it in the discord.js guide
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel("Gain access")
                        .setCustomId(`threadaccessgive:${thread.id}:${threadFirstMessage.id}`)
                        .setStyle(ButtonStyle.Primary)
                )
            ]
        });
    }

    private async chooseSubthreadChannel(channel: Channel) {
        const config = await this.config.getAllUserSettingsInChannel(channel.id);
        const subthreadChannelSelectionMethod = config.get("channelSelection");
        const subthreadChannelId = config.get("subthreadChannel");

        switch (subthreadChannelSelectionMethod) {
            default:
            case "parent":
            case "parentThenSpecified":
                if (this.canCreatePrivateThreadIn(channel)) {
                    return channel;
                }
                if ('parent' in channel && this.canCreatePrivateThreadIn(channel.parent)) {
                    return channel.parent;
                }
                if (subthreadChannelSelectionMethod == "parent") { throw new Error("Cannot create subthread here."); }

                if (!subthreadChannelId) {
                    throw new Error("Cannot create subthread here. No subthreadChannel configured to fallback to.");
                }
            case "specified":
                const defaultChannel = await this.bot.client.getChannel(subthreadChannelId);
                if (!this.canCreatePrivateThreadIn(defaultChannel)) {
                    throw new Error("Cannot create thread in (or cannot find) configured subthreadChannel.");
                }
                return defaultChannel;
        }
    }

    private canCreatePrivateThreadIn(channel: Channel | null): channel is TextChannel {
        return channel instanceof TextChannel;
    }

    private async interactionHandler(interaction: Interaction) {
        try {
            if (!interaction.isButton()) { return; }
            if (interaction.customId.startsWith("threadaccessgive:")) {
                const [command, threadId, firstMessageId] = interaction.customId.split(":");
                let thread;
                try {
                    thread = await this.bot.client.getChannel(threadId);
                    console.log(thread);
                } catch (err) {
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
            noDM: true,
            requiredDiscordPermission: "CreatePrivateThreads"
        });
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

    static generate(newThread: ThreadChannel, parentThread: Channel, lastMessage?: Message | null) {
        let message: string;
        if (lastMessage) {
            message = `\nJump: https://discord.com/channels/${newThread.guildId || "@me"}/${lastMessage.channelId}/${lastMessage.id} (in <#${parentThread.id}>)`;
        } else {
            message = `Parent thread: <#${parentThread.id}>`;
        }
        message += SubthreadFirstMessage.MENTION_AREA;
        return new Send(newThread.id, message);
    }

    static async editToMention(message: Message, ids: string[]) {
        const promises = [];
        if (message.partial) { promises.push(message.fetch()); }

        let wasThreadUnarchived = false;
        let wasThreadLocked = false;

        if (message.channel instanceof ThreadChannel) {
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
            } else {
                text = message.content + this.generateMentionLine(ids);
            }
            await message.edit(text);
        }

        if (wasThreadUnarchived) {
            promises.push((message.channel as ThreadChannel).setArchived(true));
        }
        if (wasThreadLocked) {
            promises.push((message.channel as ThreadChannel).setLocked(true));
        }
        await Promise.all(promises);
    }
}

export default Subthread;