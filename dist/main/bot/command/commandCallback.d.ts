import DiscordCommandEvent from "../events/discordCommandEvent";
declare type BotCommandCallback = (event: DiscordCommandEvent) => any;
export default BotCommandCallback;
