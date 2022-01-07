import Bot from "../bot/bot";
import DiscordCommandEvent from "../events/discordCommandEvent";
declare type BotCommandCallback = (bot: Bot, event: DiscordCommandEvent, args: string) => any;
export default BotCommandCallback;
