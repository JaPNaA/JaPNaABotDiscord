import BotHooks from "../botHooks";
import BotCommandOptions from "../command/commandOptions";
import EventName from "../eventName";
import Precommand from "../precommand/precommand";

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
    public _registerDefaultCommand(name: string, callback: Function, options?: BotCommandOptions) {
        this.bot.defaultPrecommand.commandManager.register(name, this._pluginName, callback.bind(this), options);
    }

    public _registerCommand(precommand: Precommand, name: string, callback: Function, options?: BotCommandOptions) {
        precommand.commandManager.register(name, this._pluginName, callback.bind(this), options);
    }

    /** Adds a handler function to an event */
    public _registerEventHandler(name: EventName, callback: Function) {
        this.bot.events.on(name, callback.bind(this));
    }

    /** Adds a handler function to a precommand */
    public _registerPrecommand(precommand: string | string[], callback?: Function): Precommand {
        const precommandManager = this.bot.precommandManager;
        if (callback) {
            return precommandManager.createAndRegister(precommand, callback.bind(this));
        } else {
            return precommandManager.createAndRegister(precommand);
        }
    }
}

export default BotPlugin;