import PrecommandCallback from "./precommandCallback.js";

class Precommand {
    precommandStr: string;
    callback: PrecommandCallback;

    /**
     * @param precommand text which comes before a command
     * @param callback function to call to handle precommand
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