import BotHooks from "./bot/botHooks";
import BotCommandOptions from "./botcommandOptions";
import EventName from "./bot/eventName";
declare class BotPlugin {
    private bot;
    private _pluginName;
    constructor(bot: BotHooks);
    /**
     * Starts the plugin
     */
    _start(): void;
    /**
     * Stops the plugin
     */
    _stop(): void;
    /**
     * Registers an command handler
     * @param {String} name of command, called by [precommand][name]
     * @param {Function} func function to run when called
     * @param {BotCommandOptions} [options] permission that is required to run command
     */
    _registerCommand(name: string, func: Function, options: BotCommandOptions): void;
    /**
     * Adds a handler function to an event
     * @param name of event to register to
     * @param func handler/callback function
     */
    _registerEventHandler(name: EventName, func: Function): void;
    /**
     * Adds a handler function to a precommand
     * @param precommand precommmand to handle
     * @param func function to call when precommand is triggered
     */
    _registerPrecommandHander(precommand: string, func: Function): void;
}
export default BotPlugin;
