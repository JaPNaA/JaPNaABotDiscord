import BotHooks from "./bot/botHooks";
import BotCommandOptions from "./botcommandOptions";
import EventName from "./bot/eventName";

class BotPlugin {
     // Not private due to compatability issues with JS
    public bot: BotHooks;
    public _pluginName: string;
    
    constructor(bot: BotHooks) {
        this.bot = bot;
        this._pluginName = this.constructor.name.toLowerCase();
    }

    /**
     * Starts the plugin
     */
    public _start() { }

    /**
     * Stops the plugin
     */
    public _stop() { }

    /**
     * Registers an command handler
     * @param {String} name of command, called by [precommand][name]
     * @param {Function} func function to run when called
     * @param {BotCommandOptions} [options] permission that is required to run command
     */
    public _registerCommand(name: string, func: Function, options?: BotCommandOptions) {
        this.bot.commandManager.register.command(name, this._pluginName, func.bind(this), options);
    }

    /**
     * Adds a handler function to an event
     * @param name of event to register to
     * @param func handler/callback function
     */
    _registerEventHandler(name: EventName, func: Function) {
        this.bot.events.on(name, func.bind(this));
    }

    /**
     * Adds a handler function to a precommand
     * @param precommand precommmand to handle
     * @param func function to call when precommand is triggered
     */
    _registerPrecommandHander(precommand: string, func: Function) {
        this.bot.commandManager.register.precommand(precommand, func.bind(this));
    }
}

export default BotPlugin;