import Bot from "../../bot/bot";
import DiscordCommandEvent from "../../events/discordCommandEvent";
type UnknownCommandHandler = (bot: Bot, event: DiscordCommandEvent) => void;
export default UnknownCommandHandler;