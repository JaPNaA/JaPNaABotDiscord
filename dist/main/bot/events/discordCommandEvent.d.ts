import DiscordMessageEvent from "./discordMessageEvent";
import PrecommandName from "../precommand/precommandName";
declare class DiscordCommandEvent extends DiscordMessageEvent {
    /** What came after the precommand */
    commandContent: string;
    /** Precommand used */
    precommandName: PrecommandName;
    /** Arguments of command */
    arguments: string | null;
    constructor(data: {
        messageEvent: DiscordMessageEvent;
        pre: PrecommandName;
        content: string;
    });
}
export default DiscordCommandEvent;
