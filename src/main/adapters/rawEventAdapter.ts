import { TextChannel, DMChannel } from "discord.js";
import DiscordMessageEvent from "../bot/events/discordMessageEvent";
import IMessage from "./IMessage.js";
import PrecommandName from "../bot/precommand/precommandName.js";
import Bot from "../bot/bot/bot";

class RawEventAdapter {
    constructor(private bot: Bot) { }

    /**
     * When receiving raw messages
     * @param message of sender
     */
    onMessage(message: IMessage): void {
        let precommandNameInMessage: PrecommandName | null = this.bot.precommandManager.getFirstPrecommandName(message.content);

        let channel: TextChannel | DMChannel = message.channel as TextChannel | DMChannel;
        let isDM: boolean = false;

        if (channel instanceof DMChannel) {
            isDM = true;
        } else {
            isDM = false;
        }

        const messageEvent: DiscordMessageEvent = {
            username: message.author && message.author.username,
            userId: message.author && message.author.id,
            channelId: message.channel && message.channel.id,
            serverId: message.guild && message.guild.id || "",
            messageId: message.id,
            message: message.content,
            precommandName: precommandNameInMessage,
            originalEvent: message,
            isDM: isDM,
            createdTimestamp: message.createdTimestamp
        };

        if (this.bot.client.isSelf(messageEvent.userId)) {
            this.bot.events.sent.dispatch(messageEvent);
            return;
        }

        this.bot.events.message.dispatch(messageEvent);
    }

    onReady(): void {
        this.bot.events.ready.dispatch();
    }
}

export default RawEventAdapter;