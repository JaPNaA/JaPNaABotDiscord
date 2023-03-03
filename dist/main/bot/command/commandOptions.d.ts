import { PermissionsString } from "discord.js";
import { BotCommandHelp } from "./commandHelp";
interface BotCommandOptions {
    requiredCustomPermission?: string;
    requiredDiscordPermission?: PermissionsString;
    noDM?: boolean;
    help?: BotCommandHelp;
    group?: string;
}
export default BotCommandOptions;
