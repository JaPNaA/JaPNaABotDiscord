import PrecommandCallback from "./precommandCallback.js";
declare class Precommand {
    precommandStr: string;
    callback: PrecommandCallback;
    /**
     * @param precommand text which comes before a command
     * @param callback function to call to handle precommand
     */
    constructor(precommand: string, callback: PrecommandCallback);
    toString(): string;
}
export default Precommand;
