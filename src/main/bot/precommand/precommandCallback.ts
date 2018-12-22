import { DiscordCommandEvent } from "../../events";
type PrecommandCallback = (commandEvent: DiscordCommandEvent) => any;
export default PrecommandCallback;