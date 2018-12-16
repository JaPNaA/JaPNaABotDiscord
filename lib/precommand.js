/**
 * @typedef {import("./events.js").DiscordCommandEvent} DiscordCommandEvent
 */

/**
 * @callback PrecommandCallback
 * @param {DiscordCommandEvent} commandEvent
 */

class Precommand {
    /**
     * Precommand constructor
     * @param {String} precommand text which comes before a command
     * @param {PrecommandCallback} callback function to call to handle precommand
     */
    constructor(precommand, callback) {
        this.precommandStr = precommand;
        this.callback = callback;
    }

    toString() {
        return this.precommandStr;
    }
}

module.exports = Precommand;