import BotHooks from "../botHooks";
import BotCommandOptions from "../command/commandOptions";
import EventName from "../eventName";
import Precommand from "../precommand/precommand";
declare abstract class BotPlugin {
    bot: BotHooks;
    _pluginName: string;
    constructor(bot: BotHooks);
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
    _registerCommand(precommand: Precommand, name: string, callback: Function, options?: BotCommandOptions): void;
    /** Adds a handler function to an event */
    _registerEventHandler(name: EventName, callback: Function): void;
    /** Adds a handler function to a precommand */
    _registerPrecommand(precommand: string | string[], callback?: Function): Precommand;
}
export default BotPlugin;
