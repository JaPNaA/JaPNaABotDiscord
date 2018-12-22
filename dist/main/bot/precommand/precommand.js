"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const botPermissions_js_1 = __importDefault(require("../botPermissions.js"));
const commandManager_js_1 = __importDefault(require("../command/manager/commandManager.js"));
const utils_js_1 = require("../../utils.js");
const precommandName_js_1 = __importDefault(require("./precommandName.js"));
class Precommand {
    /**
     * @param name text which comes before a command
     * @param callback function to call to handle precommand
     */
    constructor(botHooks, name, callback) {
        this.botHooks = botHooks;
        this.permissions = new botPermissions_js_1.default(botHooks);
        this.commandManager = new commandManager_js_1.default(botHooks);
        this.names = utils_js_1.toArray(name);
        if (callback) {
            this.callback = callback;
        }
        else {
            this.callback = this.commandManager.dispatch.onMessage.bind(this.commandManager.dispatch);
        }
    }
    getNameInMessage(message) {
        for (let i = 0; i < this.names.length; i++) {
            const name = this.names[i];
            if (message.startsWith(name)) {
                return new precommandName_js_1.default(this, i);
            }
        }
        return null;
    }
    toString() {
        return this.names[0];
    }
}
exports.default = Precommand;
