import { BotCommandHelp } from "./commandHelp";
interface BotCommandOptions {
    requiredPermission?: string;
    noDM?: boolean;
    help?: BotCommandHelp;
    group?: string;
}
export default BotCommandOptions;
