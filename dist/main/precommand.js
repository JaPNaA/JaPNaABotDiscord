"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = Precommand;
