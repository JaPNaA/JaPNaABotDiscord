import PrecommandCallback from "./precommandCallback.js";
declare class Precommand {
    precommandStr: string;
    callback: PrecommandCallback;
    /**
     * Precommand constructor
     * @param {String} precommand text which comes before a command
     * @param {PrecommandCallback} callback function to call to handle precommand
     */
    constructor(precommand: string, callback: PrecommandCallback);
    toString(): string;
}
export default Precommand;
