import { Interaction } from "discord.js";
import Bot from "../bot/bot";
import DiscordMessageEvent from "../events/discordMessageEvent";
import MessageOrAction from "../types/messageOrAction";
export declare class ActionRunner {
    private bot;
    constructor(bot: Bot);
    /** Tries to run command, and sends an error message if fails */
    run(generator: AsyncGenerator<MessageOrAction> | Generator<MessageOrAction>, messageEvent: DiscordMessageEvent, interaction?: Interaction): Promise<void>;
    private generatorWrapper;
    private getErrorAction;
}
