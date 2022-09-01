import { MessageOptions } from "discord.js";
import { Action } from "../actions/actions";
import DiscordCommandEvent from "../events/discordCommandEvent";
declare type MessageOrAction = Action | string | MessageOptions;
declare type BotCommandCallback = (event: DiscordCommandEvent) => Generator<MessageOrAction> | AsyncGenerator<MessageOrAction>;
export default BotCommandCallback;
