import Bot from "../../bot/bot";
import DiscordCommandEvent from "../../events/discordCommandEvent";
declare type UnknownCommandHandler = (bot: Bot, event: DiscordCommandEvent) => void;
export default UnknownCommandHandler;
