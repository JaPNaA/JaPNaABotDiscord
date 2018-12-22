import BotHooks from "../botHooks";
import BotCommandOptions from "../command/commandOptions";
import EventName from "../eventName";

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

    /** Registers a command handler */
    public _registerCommand(name: string, callback: Function, options?: BotCommandOptions) {
        this.bot.commandManager.register.command(name, this._pluginName, callback.bind(this), options);
    }

    /** Adds a handler function to an event */
    _registerEventHandler(name: EventName, callback: Function) {
        this.bot.events.on(name, callback.bind(this));
    }

    /** Adds a handler function to a precommand */
    _registerPrecommandHander(precommand: string, callback: Function) {
        this.bot.commandManager.register.precommand(precommand, callback.bind(this));
    }
}

export default BotPlugin;