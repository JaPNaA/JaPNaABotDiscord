import DiscordCommandEvent from "../types/discordCommandEvent";
type PrecommandCallback = (commandEvent: DiscordCommandEvent) => any;
export default PrecommandCallback;