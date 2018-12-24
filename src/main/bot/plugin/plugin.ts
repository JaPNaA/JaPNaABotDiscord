import BotHooks from "../botHooks";
import BotCommandOptions from "../command/commandOptions";
import EventName from "../eventName";
import { PrecommandWithoutCallback, Precommand, PrecommandWithCallback } from "../precommand/precommand";
import PrecommandManager from "../precommand/manager/precommandManager";
import UnknownCommandHandler from "../command/manager/unknownCommandHandler";
import CommandManager from "../command/manager/commandManager";
import BotCommandCallback from "../command/commandCallback";

abstract class BotPlugin {
    // not private due to compatability issues with JS
    public bot: BotHooks;
    public _pluginName: string;

    constructor(bot: BotHooks) {
        this.bot = bot;
        this._pluginName = this.constructor.name.toLowerCase();
    }

    /**
     * Starts the plugin
     */
    public abstract _start(): void;

    /**
     * Stops the plugin
     */
    public abstract _stop(): void;

    /** Registers a command handler */
    public _registerDefaultCommand(name: string, callback: Function, options?: BotCommandOptions): void {
        this.bot.defaultPrecommand.commandManager.register(
            name, this._pluginName, callback.bind(this), options
        );
    }

    public _registerCommand(commandManager: CommandManager, name: string,
        callback: BotCommandCallback, options?: BotCommandOptions): void;
    public _registerCommand(precommand: PrecommandWithoutCallback, name: string,
        callback: BotCommandCallback, options?: BotCommandOptions): void;

    public _registerCommand(precommandOrCommandManager: CommandManager | PrecommandWithoutCallback,
        name: string, callback: BotCommandCallback, options?: BotCommandOptions): void {
        let commandManager: CommandManager;

        if (precommandOrCommandManager instanceof PrecommandWithoutCallback) {
            commandManager = precommandOrCommandManager.commandManager;
        } else {
            commandManager = precommandOrCommandManager;
        }

        commandManager.register(name, this._pluginName, callback.bind(this), options);
    }

    public _registerUnknownCommandHandler(precommand: PrecommandWithoutCallback, func: UnknownCommandHandler) {
        precommand.commandManager.registerUnkownCommandHanlder(func.bind(this));
    }

    /** Adds a handler function to an event */
    public _registerEventHandler(name: EventName, callback: Function): void {
        this.bot.events.on(name, callback.bind(this));
    }

    public _registerPrecommand(precommand: string | string[]): PrecommandWithoutCallback;
    public _registerPrecommand(precommand: string | string[],
        callback: Function): PrecommandWithCallback;

    /** Adds a handler function to a precommand */
    public _registerPrecommand(precommand: string | string[], callback?: Function): Precommand {
        const precommandManager: PrecommandManager = this.bot.precommandManager;
        if (callback) {
            return precommandManager.createAndRegister(precommand, callback.bind(this));
        } else {
            return precommandManager.createAndRegister(precommand);
        }
    }
}

export default BotPlugin;