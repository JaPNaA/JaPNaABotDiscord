import DiscordCommandEvent from "../../events/discordCommandEvent";
type UnknownCommandHandler = (event: DiscordCommandEvent) => void;
export default UnknownCommandHandler;