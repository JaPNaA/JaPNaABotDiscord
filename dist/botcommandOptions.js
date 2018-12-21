"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @typedef {import("./botcommandHelp.js")} BotCommandHelp
 */
class BotCommandOptions {
    /**
     * BotCommandOptions
     * @param options command triggering options
     */
    constructor(options) {
        this.requiredPermission = options.requiredPermission;
        this.noDM = options.noDM;
        this.help = options.help;
        this.group = options.group;
    }
}
exports.default = BotCommandOptions;