"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Precommand {
    /**
     * @param precommand text which comes before a command
     * @param callback function to call to handle precommand
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
