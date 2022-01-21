import BotCommandOptions from "../command/commandOptions";
import EventName from "../types/eventName";
import { PrecommandWithoutCallback, PrecommandWithCallback } from "../precommand/precommand";
import UnknownCommandHandler from "../command/manager/unknownCommandHandler";
import CommandManager from "../command/manager/commandManager";
import BotCommandCallback from "../command/commandCallback";
import Bot from "../bot/bot";
import EventHandler from "../types/eventHandler";
import PrecommandCallback from "../precommand/precommandCallback";
import PluginConfig from "./pluginConfig";
declare abstract class BotPlugin {
    protected bot: Bot;
    pluginName: string;
    protected config: PluginConfig;
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
    protected _registerUnknownCommandHandler(commandManager: CommandManager, func: UnknownCommandHandler): void;
    protected _registerUnknownCommandHandler(precommand: PrecommandWithoutCallback, func: UnknownCommandHandler): void;
    /** Adds a handler function to an event */
    protected _registerEventHandler(name: EventName, callback: EventHandler): void;
    protected _registerPrecommand(precommand: string | string[]): PrecommandWithoutCallback;
    protected _registerPrecommand(precommand: string | string[], callback: PrecommandCallback): PrecommandWithCallback;
}
export default BotPlugin;
