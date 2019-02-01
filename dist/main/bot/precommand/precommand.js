"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_js_1 = require("../../utils/utils.js");
const precommandName_js_1 = __importDefault(require("./precommandName.js"));
const botPermissions_js_1 = __importDefault(require("../bot/botPermissions.js"));
const commandManager_js_1 = __importDefault(require("../command/manager/commandManager.js"));
class Precommand {
    /**
     * @param name text which comes before a command
     * @param callback function to call to handle precommand
     */
    constructor(botHooks, name) {
        this.botHooks = botHooks;
        this.names = utils_js_1.toArray(name);
    }
    static create(botHooks, name, callback) {
        let nameArr = utils_js_1.toArray(name);
        if (callback) {
            return new PrecommandWithCallback(botHooks, nameArr, callback);
        }
        else {
            return new PrecommandWithoutCallback(botHooks, nameArr);
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
exports.Precommand = Precommand;
class PrecommandWithCallback extends Precommand {
    constructor(botHooks, name, callback) {
        super(botHooks, name);
        this.names = utils_js_1.toArray(name);
        this.callback = callback;
    }
}
exports.PrecommandWithCallback = PrecommandWithCallback;
class PrecommandWithoutCallback extends Precommand {
    constructor(botHooks, name) {
        super(botHooks, name);
        this.permissions = new botPermissions_js_1.default(botHooks);
        this.commandManager = new commandManager_js_1.default(botHooks);
        this.names = name;
        let commandDispatcher = this.commandManager.dispatch;
        this.callback = commandDispatcher.onMessage.bind(commandDispatcher);
    }
}
exports.PrecommandWithoutCallback = PrecommandWithoutCallback;
