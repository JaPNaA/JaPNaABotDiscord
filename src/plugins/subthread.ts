import { ThreadChannel, Interaction, TextChannel, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle, Channel, ChannelType } from "discord.js";
import { ReplySoft, ReplyThreadSoft, ReplyUnimportant, Send } from "../main/bot/actions/actions";
import Bot from "../main/bot/bot/bot";
import DiscordCommandEvent from "../main/bot/events/discordCommandEvent";
import BotPlugin from "../main/bot/plugin/plugin";
import Logger from "../main/utils/logger";
import ellipsisize from "../main/utils/str/ellipsisize";
import mention from "../main/utils/str/mention";
import removeFormattingChars from "../main/utils/str/removeFormattingChars";
import CommandArguments from "../main/bot/command/commandArguments";
import getSnowflakeNum from "../main/utils/getSnowflakeNum";

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
        },
        "usePrivateThreads": {
            type: "boolean",
            comment: "Should mark subthreads as private? Setting threads private prevents Discord from sending a thread creation announcement. Setting threads public removes the need for the 'Gain Access' button. Note that when creating a subthread across channels, if any channel uses private threads, a private thread will be made.",
            default: true
        }
    };

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "subthread";
    }

    public async *subthread(event: DiscordCommandEvent) {
        const args = new CommandArguments(event.arguments).parse({
            overloads: [["name", "parentChannel"], ["parentChannel", "name"], ["parentChannel"], ["name"]],
            allowMultifinal: true,
            check: {
                parentChannel: x => Boolean(x && !x.match(/[\sa-z]/) && getSnowflakeNum(x))
            }
        });
        const parentChannelArg = args.get("parentChannel");
        const channel = await this.bot.client.getChannel(event.channelId);
        if (!channel) { throw new Error("Channel not found"); }

        let threadTitle = args.get("name")?.trim();
        let lastMessage;

        // choose parent channel
        let parentChannel;
        if (parentChannelArg) {
            const snowflake = getSnowflakeNum(parentChannelArg);
            if (!snowflake) { throw new Error("No snowflake provided in argument"); }
            parentChannel = await this.bot.client.getChannel(snowflake)
        } else {
            parentChannel = await this.chooseSubthreadChannel(channel);
        }

        if (!parentChannel) {
            throw new Error("Parent channel not found");
        }
        if (!(parentChannel instanceof TextChannel)) {
            return new ReplyUnimportant("Cannot make subthread: the channel specified is not a (normal) text channel");
        }

        // determine title
        if (!threadTitle) {
            // automatic title (no title provided)
            if (!('lastMessage' in channel)) { return new ReplyUnimportant("Cannot get last message in this channel."); }
            if (!channel.lastMessage) { return new ReplyUnimportant("Must provide a thread title because no last message was found in this channel."); }
            if (channel.lastMessage.hasThread) { return new ReplyUnimportant("Must provide a thread title to create new thread since the last message already has a thread"); }
            threadTitle = channel.lastMessage.content;
            lastMessage = channel.lastMessage;
        }
        threadTitle = ellipsisize(removeFormattingChars(threadTitle), 100) || "Untitled";

        // check if should be private
        const isUsePrivateThreads =
            await this.config.getInChannel(channel.id, "usePrivateThreads") ||
            await this.config.getInChannel(parentChannel.id, "usePrivateThreads");

        // check permissions
        if (
            !(await this.bot.permissions.getPermissions_channel(event.userId, event.serverId, parentChannel.id))
                .hasDiscord(isUsePrivateThreads ? "CreatePrivateThreads" : "CreatePublicThreads")
        ) {
            return new ReplyUnimportant(
                "You do not have permission to make " +
                (isUsePrivateThreads ? "private" : "public") +
                " threads in <#" + parentChannel.id + ">"
            );
        }

        // can create normal thread instead
        if (parentChannel === channel) {
            return new ReplyThreadSoft(threadTitle, {
                startMessage: lastMessage,
            });
        }

        let thread = await parentChannel.threads.create({
            name: ellipsisize(threadTitle + ('name' in channel ? ` (in ${channel.name})` : ""), 100),
            type: isUsePrivateThreads ? ChannelType.PrivateThread : ChannelType.PublicThread
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

        return new ReplySoft({
            content: "**Subthread** " + (lastMessage ? "from last message" : `_${threadTitle}_`) + `\n--> <#${thread.id}>`,
            // @ts-ignore -- This fails typechecks, but is how they do it in the discord.js guide
            components: isUsePrivateThreads ? [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel("Gain access")
                        .setCustomId(`threadaccessgive:${thread.id}:${threadFirstMessage.id}`)
                        .setStyle(ButtonStyle.Primary)
                )
            ] : undefined
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
                if (this.canCreateThreadIn(channel)) {
                    return channel;
                }
                if ('parent' in channel && this.canCreateThreadIn(channel.parent)) {
                    return channel.parent;
                }
                if (subthreadChannelSelectionMethod == "parent") { throw new Error("Cannot create subthread here."); }

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

    private canCreateThreadIn(channel: Channel | null): channel is TextChannel {
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
            noDM: true
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
            message = `\nJump: https://discord.com/channels/${newThread.guildId || "@me"}/${lastMessage.channelId}/${lastMessage.id}`;
        } else {
            message = `Parent thread: <#${parentThread.id}>`;
        }
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