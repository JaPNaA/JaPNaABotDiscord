import BotCommandOptions from "../command/commandOptions";
import EventName from "../types/eventName";
import { PrecommandWithoutCallback, PrecommandWithCallback } from "../precommand/precommand";
import UnknownCommandHandler from "../command/manager/unknownCommandHandler";
import CommandManager from "../command/manager/commandManager";
import BotCommandCallback from "../command/commandCallback";
import Bot from "../bot/bot";
declare abstract class BotPlugin {
    protected bot: Bot;
    _pluginName: string;
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
    _registerDefaultCommand(name: string, callback: Function, options?: BotCommandOptions): void;
    _registerCommand(commandManager: CommandManager, name: string, callback: BotCommandCallback, options?: BotCommandOptions): void;
    _registerCommand(precommand: PrecommandWithoutCallback, name: string, callback: BotCommandCallback, options?: BotCommandOptions): void;
    _registerUnknownCommandHandler(commandManager: CommandManager, func: UnknownCommandHandler): void;
    _registerUnknownCommandHandler(precommand: PrecommandWithoutCallback, func: UnknownCommandHandler): void;
    /** Adds a handler function to an event */
    _registerEventHandler(name: EventName, callback: Function): void;
    _registerPrecommand(precommand: string | string[]): PrecommandWithoutCallback;
    _registerPrecommand(precommand: string | string[], callback: Function): PrecommandWithCallback;
}
export default BotPlugin;
