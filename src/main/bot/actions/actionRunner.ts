import { Interaction } from "discord.js";
import { inspect } from "node:util";
import { createErrorString } from "../../utils/allUtils";
import Logger from "../../utils/logger";
import Bot from "../bot/bot";
import DiscordMessageEvent from "../events/discordMessageEvent";
import MessageOrAction from "../types/messageOrAction";
import { Action, ReplySoft } from "./actions";

export class ActionRunner {
    constructor(private bot: Bot) { }

    /** Tries to run command, and sends an error message if fails */
    async run(generator: AsyncGenerator<MessageOrAction> | Generator<MessageOrAction>, messageEvent: DiscordMessageEvent, interaction?: Interaction) {
        const wrapped = this.generatorWrapper(generator, messageEvent);
        for await (const action of wrapped) {
            if (interaction) {
                await action.performInteraction(this.bot, interaction);
            } else {
                await action.perform(this.bot, messageEvent);
            }
        }
    }

    private async *generatorWrapper(generator: AsyncGenerator<MessageOrAction> | Generator<MessageOrAction>, messageEvent: DiscordMessageEvent) {
        try {
            let result;
            do {
                result = await generator.next();
                const action = result.value;
                if (action instanceof Action) {
                    yield action;
                } else if (action) {
                    yield new ReplySoft(action);
                }
            } while (!result.done);
        } catch (error) {
            yield this.getErrorAction(messageEvent, error as Error);
        }
    }

    private getErrorAction(messageEvent: DiscordMessageEvent, error: Error) {
        const errorStr: string = createErrorString(error);

        const messageShort = "An error occured\n```" + error.message;
        const messageLong =
            "```An error occured" +
            "\nEvent: " + inspect(messageEvent, { depth: 3 }) +
            "\n" + errorStr;

        Logger.warn(messageLong);

        return new ReplySoft(messageShort.slice(0, 1997) + "```");
    }
}