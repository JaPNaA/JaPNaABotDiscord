import DiscordMessageEvent from "./discordMessageEvent";
import PrecommandName from "../precommand/precommandName";

interface DiscordCommandEvent extends DiscordMessageEvent {
    /** What came after the precommand */
    commandContent: string;
    /** Precommand used */
    precommandName: PrecommandName;
    /** Arguments of command */
    arguments: string;
}

export default DiscordCommandEvent;