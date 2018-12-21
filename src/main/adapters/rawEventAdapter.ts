import BotHooks from "../bot/botHooks.js";
import { Message, TextChannel } from "discord.js";
import { DiscordMessageEvent } from "../events.js";

class RawEventAdapter {
    botHooks: BotHooks;
    constructor(botHooks: BotHooks) {
        this.botHooks = botHooks;
    }

    /**
     * When receiving raw messages
     * @param message of sender
     */
    onMessage(message: Message) {
        let precommandUsedInMessage = this.botHooks.commandManager.getFirstPrecommand(message.content);

        let channel = message.channel as TextChannel;
        let isDM = channel.guild ? false : true;

        const messageEvent: DiscordMessageEvent =
            new DiscordMessageEvent(
                message.author && message.author.username,
                message.author && message.author.id,
                message.channel && message.channel.id,
                message.guild && message.guild.id,
                message.content, precommandUsedInMessage, message, isDM
            );

        if (this.botHooks.client.isSelf(messageEvent.userId)) {
            this.botHooks.events.dispatch("sent", messageEvent);
            return;
        }

        this.botHooks.events.dispatch("message", messageEvent);

        this.botHooks.commandManager.dispatch.onMessage(messageEvent);
    }

    onReady() {
        this.botHooks.events.dispatch("ready", null);
    }
}

export default RawEventAdapter;