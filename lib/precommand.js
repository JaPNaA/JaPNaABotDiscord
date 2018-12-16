class Precommand {
    /**
     * Precommand constructor
     * @param {String} precommand text which comes before a command
     * @param {Function} callback function to call to handle precommand
     */
    constructor(precommand, callback) {
        this.precommandStr = precommand;
        this.callback = callback;
    }
}

module.exports = Precommand;