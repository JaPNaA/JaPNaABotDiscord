import BotHooks from "./bot/botHooks";
import BotCommandOptions from "./bot/precommand/command/commandOptions";
import EventName from "./bot/eventName";
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
    _registerCommand(name: string, callback: Function, options?: BotCommandOptions): void;
    /** Adds a handler function to an event */
    _registerEventHandler(name: EventName, callback: Function): void;
    /** Adds a handler function to a precommand */
    _registerPrecommandHander(precommand: string, callback: Function): void;
}
export default BotPlugin;
