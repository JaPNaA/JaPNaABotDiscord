import BotCommandOptions from "../command/commandOptions";
import { PrecommandWithoutCallback, PrecommandWithCallback } from "../precommand/precommand";
import CommandManager from "../command/manager/commandManager";
import BotCommandCallback from "../command/commandCallback";
import Bot from "../bot/bot";
import PrecommandCallback from "../precommand/precommandCallback";
import PluginConfig from "./pluginConfig";
declare abstract class BotPlugin {
    protected bot: Bot;
    pluginName: string;
    config: PluginConfig;
    userConfigSchema: {
        [x: string]: {
            type: string;
            comment: string;
            default: any;
        };
    };
    constructor(bot: Bot);
    /**
     * Starts the plugin
     */
    abstract _start(): void;
    /**
     * Stops the plugin
     */
    abstract _stop(): void;
    /** Registers a command handler */
    protected _registerDefaultCommand(name: string, callback: BotCommandCallback, options?: BotCommandOptions): void;
    protected _registerCommand(commandManager: CommandManager, name: string, callback: BotCommandCallback, options?: BotCommandOptions): void;
    protected _registerCommand(precommand: PrecommandWithoutCallback, name: string, callback: BotCommandCallback, options?: BotCommandOptions): void;
    protected _registerUnknownCommandHandler(commandManager: CommandManager, func: BotCommandCallback): void;
    protected _registerUnknownCommandHandler(precommand: PrecommandWithoutCallback, func: BotCommandCallback): void;
    protected _registerPrecommand(precommand: string | string[]): PrecommandWithoutCallback;
    protected _registerPrecommand(precommand: string | string[], callback: PrecommandCallback): PrecommandWithCallback;
}
export default BotPlugin;
