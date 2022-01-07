import DiscordCommandEvent from "../events/discordCommandEvent";

type BotCommandCallback = (event: DiscordCommandEvent) => any;
export default BotCommandCallback;