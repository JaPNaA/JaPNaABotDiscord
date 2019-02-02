import DiscordCommandEvent from "../../events/discordCommandEvent";
import BotHooks from "../../bot/botHooks";
type UnknownCommandHandler = (bot: BotHooks, event: DiscordCommandEvent) => void;
export default UnknownCommandHandler;