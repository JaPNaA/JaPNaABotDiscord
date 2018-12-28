import BotHooks from "../bot/botHooks.js";
import { TextChannel, DMChannel } from "discord.js";
import { DiscordMessageEvent } from "../events.js";
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
            new DiscordMessageEvent(
                message.author && message.author.username,
                message.author && message.author.id,
                message.channel && message.channel.id,
                message.guild && message.guild.id,
                message.content, precommandNameInMessage,
                message, isDM
            );

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