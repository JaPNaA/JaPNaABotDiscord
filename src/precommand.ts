import events from "./events.js";

type PrecommandCallback = (commandEvent: events.DiscordCommandEvent) => any;

class Precommand {
    precommandStr: string;
    callback: PrecommandCallback;

    /**
     * Precommand constructor
     * @param {String} precommand text which comes before a command
     * @param {PrecommandCallback} callback function to call to handle precommand
     */
    constructor(precommand: string, callback: PrecommandCallback) {
        this.precommandStr = precommand;
        this.callback = callback;
    }

    public toString(): string{
        return this.precommandStr;
    }
}

export default Precommand;