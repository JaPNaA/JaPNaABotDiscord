/**
 * @typedef {import("./events.js").DiscordCommandEvent} DiscordCommandEvent
 */
/**
 * @callback PrecommandCallback
 * @param {DiscordCommandEvent} commandEvent
 */
declare class Precommand {
    /**
     * Precommand constructor
     * @param {String} precommand text which comes before a command
     * @param {PrecommandCallback} callback function to call to handle precommand
     */
    constructor(precommand: any, callback: any);
    toString(): any;
}
