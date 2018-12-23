import BotHooks from "../botHooks";
import BotCommandOptions from "../command/commandOptions";
import EventName from "../eventName";
import { PrecommandWithoutCallback, PrecommandWithCallback } from "../precommand/precommand";
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
    _registerCommand(precommand: PrecommandWithoutCallback, name: string, callback: Function, options?: BotCommandOptions): void;
    /** Adds a handler function to an event */
    _registerEventHandler(name: EventName, callback: Function): void;
    _registerPrecommand(precommand: string | string[]): PrecommandWithoutCallback;
    _registerPrecommand(precommand: string | string[], callback: Function): PrecommandWithCallback;
}
export default BotPlugin;
