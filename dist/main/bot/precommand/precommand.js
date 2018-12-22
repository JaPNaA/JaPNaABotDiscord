"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const botPermissions_js_1 = __importDefault(require("../botPermissions.js"));
const commandManager_js_1 = __importDefault(require("./command/manager/commandManager.js"));
class Precommand {
    /**
     * @param precommand text which comes before a command
     * @param callback function to call to handle precommand
     */
    constructor(botHooks, precommand, callback) {
        this.botHooks = botHooks;
        this.precommandStr = precommand;
        this.callback = callback;
        this.permissions = new botPermissions_js_1.default(botHooks);
        this.commandManager = new commandManager_js_1.default(botHooks);
    }
    toString() {
        return this.precommandStr;
    }
}
exports.default = Precommand;
