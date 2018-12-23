import BotHooks from "../botHooks";
import BotCommandOptions from "../command/commandOptions";
import EventName from "../eventName";
import Precommand from "../precommand/precommand";
declare class BotPlugin {
    bot: BotHooks;
    _pluginName: string;
    constructor(bot: BotHooks);
    /**
     * Starts the plugin
     */
    _start(): void;
    /**
     * Stops the plugin
     */
    _stop(): void;
    /** Registers a command handler */
    _registerDefaultCommand(name: string, callback: Function, options?: BotCommandOptions): void;
    _registerCommand(precommand: Precommand, name: string, callback: Function, options?: BotCommandOptions): void;
    /** Adds a handler function to an event */
    _registerEventHandler(name: EventName, callback: Function): void;
    /** Adds a handler function to a precommand */
    _registerPrecommand(precommand: string | string[], callback?: Function): Precommand;
}
export default BotPlugin;
