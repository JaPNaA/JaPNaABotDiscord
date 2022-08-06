"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFullCommandHelp = void 0;
/**
 * Gathers some information about command
 */
function getFullCommandHelp(command, help) {
    return {
        ...help || { description: "" },
        group: command.group,
        noDM: command.noDM || false,
        requiredDiscordPermission: command.requiredDiscordPermission,
        requiredCustomPermission: command.requiredCustomPermission,
        fromPlugin: command.pluginName
    };
}
exports.getFullCommandHelp = getFullCommandHelp;
