"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const botPermissions_1 = __importDefault(require("../botPermissions"));
const commandManager_1 = __importDefault(require("../command/manager/commandManager"));
const precommand_1 = __importDefault(require("./precommand"));
class PrecommandWithoutCallback extends precommand_1.default {
    constructor(botHooks, name) {
        super(botHooks, name);
        this.permissions = new botPermissions_1.default(botHooks);
        this.commandManager = new commandManager_1.default(botHooks);
        this.names = name;
        let commandDispatcher = this.commandManager.dispatch;
        this.callback = commandDispatcher.onMessage.bind(commandDispatcher);
    }
}
exports.default = PrecommandWithoutCallback;
