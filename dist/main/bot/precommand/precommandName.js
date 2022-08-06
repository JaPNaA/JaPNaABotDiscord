"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PrecommandName {
    /** Associated Precommand */
    precommand;
    /** Index of precommand name in parent precommand */
    index;
    /** The precommand string */
    name;
    constructor(precommand, index) {
        this.precommand = precommand;
        this.index = index;
        this.name = precommand.names[index];
    }
}
exports.default = PrecommandName;
