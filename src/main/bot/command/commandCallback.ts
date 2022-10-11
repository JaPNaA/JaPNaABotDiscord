import DiscordCommandEvent from "../events/discordCommandEvent";
import MessageOrAction from "../types/messageOrAction";

type BotCommandCallback = (event: DiscordCommandEvent) => Generator<MessageOrAction> | AsyncGenerator<MessageOrAction>;
export default BotCommandCallback;
