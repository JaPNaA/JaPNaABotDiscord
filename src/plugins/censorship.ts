import DiscordMessageEvent from "../main/bot/events/discordMessageEvent";

import BotPlugin from "../main/bot/plugin/plugin.js";
import Bot from "../main/bot/bot/bot";
import { EventControls } from "../main/bot/events/eventHandlers";
import Logger from "../main/utils/logger";
import { MessageCreateOptions } from "discord.js";

/**
 * Keep channels 'clean,' and get rid free speech.
 */
class Censorship extends BotPlugin {
    public userConfigSchema = {
        enabled: {
            type: "boolean",
            comment: "Enable censorship?",
            default: false
        },
        deleteCensoredMessages: {
            type: "boolean",
            comment: "Should the bot delete censored messages? (Otherwise, the bot only ignores the message)",
            default: false
        },
        alertSenderCensor: {
            type: "boolean",
            comment: "Should the sender of the message be DMed and alert about the censor?",
            default: false
        },
        targets: {
            type: "object",
            comment: "What to censor. Array of RegEx strings (case insensitive).",
            default: ["\\[censor this message\\]"]
        }
    };

    constructor(bot: Bot) {
        super(bot);
        this.pluginName = "censorship";
    }

    async messageHandler(event: DiscordMessageEvent, eventControls: EventControls) {
        const config = await this.config.getAllUserSettingsInChannel(event.channelId);
        if (!config.get("enabled")) { return; }
        if (!await this._isUserMessage(this.bot, event)) { return; }
        const targetMatches = config.get("targets");

        for (const target of targetMatches) {
            const regex = new RegExp(target, "i");
            if (regex.test(event.message)) {
                Logger.log("Incoming message censored");

                if (await config.get("deleteCensoredMessages")) {
                    const channel = await this.bot.client.getChannel(event.channelId);
                    if (channel && channel.isTextBased() && 'messages' in channel) {
                        const message = await channel.messages.fetch(event.messageId);
                        if (message) {
                            await message.delete();
                        }
                    }
                }

                if (await config.get("alertSenderCensor")) {
                    this.bot.client.sendDM(event.userId, "Your message was censored.");
                }

                eventControls.stopPropagation();
                eventControls.preventSystemNext();
                break;
            }
        }
    }

    async sendMessageHandler(
        { channelId, content }: { channelId: string, content: string | MessageCreateOptions },
        eventControls: EventControls
    ) {
        const config = await this.config.getAllUserSettingsInChannel(channelId);
        if (!config.get("enabled")) { return; }

        const targetMatches = config.get("targets");

        if (typeof content !== "string") { return; }

        for (const target of targetMatches) {
            const regex = new RegExp(target, "i");
            if (regex.test(content)) {
                Logger.log("Outgoing message censored");

                eventControls.stopPropagation();
                eventControls.preventSystemNext();
                break;
            }
        }
    }

    async _isUserMessage(bot: Bot, event: DiscordMessageEvent): Promise<boolean> {
        const user = await bot.client.getUser(event.userId);
        return Boolean(
            user && !user.bot
        );
    }

    _start(): void {
        this.bot.events.message.addHighPriorityHandler(this.messageHandler.bind(this));
        this.bot.events.send.addHighPriorityHandler(this.sendMessageHandler.bind(this));
    }

    _stop(): void {
        // do nothing
    }
}

export default Censorship;