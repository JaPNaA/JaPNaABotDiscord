import DiscordMessageEvent from "./discordMessageEvent";
import PrecommandName from "../precommand/precommandName";

class DiscordCommandEvent extends DiscordMessageEvent {
    /** What came after the precommand */
    commandContent: string;
    /** Precommand used */
    precommandName: PrecommandName;
    /** Arguments of command */
    arguments: string | null = null;

    constructor(data: {
        messageEvent: DiscordMessageEvent,
        pre: PrecommandName,
        content: string
    }) {
        // inheirt all properties of DiscordMessageEvent
        super(data.messageEvent);

        this.precommandName = data.pre;
        this.commandContent = data.content;
    }
}

export default DiscordCommandEvent;