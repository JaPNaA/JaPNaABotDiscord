"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PrecommandName {
    constructor(precommand, index) {
        this.precommand = precommand;
        this.index = index;
        this.name = precommand.names[index];
    }
}
exports.default = PrecommandName;
