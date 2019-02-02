import DiscordCommandEvent from "../../events/discordCommandEvent";
import BotHooks from "../../bot/botHooks";
declare type UnknownCommandHandler = (bot: BotHooks, event: DiscordCommandEvent) => void;
export default UnknownCommandHandler;
