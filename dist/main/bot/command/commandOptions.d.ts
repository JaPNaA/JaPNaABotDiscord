import { PermissionString } from "discord.js";
import { BotCommandHelp } from "./commandHelp";
interface BotCommandOptions {
    requiredCustomPermission?: string;
    requiredDiscordPermission?: PermissionString;
    noDM?: boolean;
    help?: BotCommandHelp;
    group?: string;
}
export default BotCommandOptions;
