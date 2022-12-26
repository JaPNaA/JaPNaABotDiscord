import DiscordCommandEvent from "../events/discordCommandEvent";
type PrecommandCallback = (commandEvent: DiscordCommandEvent) => any;
export default PrecommandCallback;
