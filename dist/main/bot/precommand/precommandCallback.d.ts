import DiscordCommandEvent from "../events/discordCommandEvent";
declare type PrecommandCallback = (commandEvent: DiscordCommandEvent) => any;
export default PrecommandCallback;
