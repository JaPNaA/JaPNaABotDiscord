"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const precommandDispatcher_1 = __importDefault(require("./precommandDispatcher"));
const precommand_1 = require("../precommand");
class PrecommandManager {
    constructor(botHooks) {
        this.botHooks = botHooks;
        this.dispatch = new precommandDispatcher_1.default(botHooks, this);
        this.precommands = [];
    }
    register(precommand) {
        this.precommands.push(precommand);
    }
    createAndRegister(name, callback) {
        let precommand;
        if (callback) {
            precommand = precommand_1.Precommand.create(this.botHooks, name, callback);
        }
        else {
            precommand = precommand_1.Precommand.create(this.botHooks, name);
        }
        this.precommands.push(precommand);
        return precommand;
    }
    /**
     * checks if message starts with a precommand
     */
    getFirstPrecommandName(message) {
        for (let precommand of this.precommands) {
            let precommandNameInMessage = precommand.getNameInMessage(message);
            if (precommandNameInMessage) {
                return precommandNameInMessage;
            }
        }
        return null;
    }
}
exports.default = PrecommandManager;
