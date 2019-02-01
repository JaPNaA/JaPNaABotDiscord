import BotHooks from "../bot/bot/botHooks.js";
import { TextChannel, DMChannel } from "discord.js";
import DiscordMessageEvent from "../bot/types/discordMessageEvent";
import IMessage from "./IMessage.js";
import PrecommandName from "../bot/precommand/precommandName.js";

class RawEventAdapter {
    botHooks: BotHooks;
    constructor(botHooks: BotHooks) {
        this.botHooks = botHooks;
    }

    /**
     * When receiving raw messages
     * @param message of sender
     */
    onMessage(message: IMessage): void {
        let precommandNameInMessage: PrecommandName | null = this.botHooks.precommandManager.getFirstPrecommandName(message.content);

        let channel: TextChannel | DMChannel = message.channel as TextChannel | DMChannel;
        let isDM: boolean = false;

        if (channel instanceof DMChannel) {
            isDM = true;
        } else {
            isDM = false;
        }

        const messageEvent: DiscordMessageEvent =
            new DiscordMessageEvent({
                username: message.author && message.author.username,
                userId: message.author && message.author.id,
                channelId: message.channel && message.channel.id,
                serverId: message.guild && message.guild.id,
                message: message.content,
                precommandName: precommandNameInMessage,
                originalEvent: message, 
                isDM: isDM,
                createdTimestamp: message.createdTimestamp
            });

        if (this.botHooks.client.isSelf(messageEvent.userId)) {
            this.botHooks.events.dispatch("sent", messageEvent);
            return;
        }

        this.botHooks.events.dispatch("message", messageEvent);
    }

    onReady(): void {
        this.botHooks.events.dispatch("ready", null);
    }
}

export default RawEventAdapter;