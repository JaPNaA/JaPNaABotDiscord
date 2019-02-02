import BotHooks from "../bot/botHooks";
import DiscordCommandEvent from "../events/discordCommandEvent";
declare type BotCommandCallback = (bot: BotHooks, event: DiscordCommandEvent, args: string) => any;
export default BotCommandCallback;
