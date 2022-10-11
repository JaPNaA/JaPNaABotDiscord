import BotCommandOptions from "../command/commandOptions";
import { PrecommandWithoutCallback, Precommand, PrecommandWithCallback } from "../precommand/precommand";
import PrecommandManager from "../precommand/manager/precommandManager";
import CommandManager from "../command/manager/commandManager";
import BotCommandCallback from "../command/commandCallback";
import Bot from "../bot/bot";
import PrecommandCallback from "../precommand/precommandCallback";
import PluginConfig from "./pluginConfig";
import MessageOrAction from "../types/messageOrAction";
import DiscordMessageEvent from "../events/discordMessageEvent";
import { ActionRunner } from "../actions/actionRunner";
import { EventControls } from "../events/eventHandlers";

abstract class BotPlugin {
    public pluginName: string;

    public config: PluginConfig;
    public userConfigSchema: {
        [x: string]: {
            type: string,
            comment: string,
            default: any
        }
    } = {};

    constructor(protected bot: Bot) {
        this.pluginName = this.constructor.name.toLowerCase();
        this.config = new PluginConfig(this, bot);
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
    protected _registerDefaultCommand(name: string, callback: BotCommandCallback, options?: BotCommandOptions): void {
        this.bot.defaultPrecommand.commandManager.register(
            name, this.pluginName, callback.bind(this), options
        );
    }

    protected _registerCommand(commandManager: CommandManager, name: string,
        callback: BotCommandCallback, options?: BotCommandOptions): void;
    protected _registerCommand(precommand: PrecommandWithoutCallback, name: string,
        callback: BotCommandCallback, options?: BotCommandOptions): void;

    protected _registerCommand(precommandOrCommandManager: CommandManager | PrecommandWithoutCallback,
        name: string, callback: BotCommandCallback, options?: BotCommandOptions): void {
        let commandManager: CommandManager;

        if (precommandOrCommandManager instanceof PrecommandWithoutCallback) {
            commandManager = precommandOrCommandManager.commandManager;
        } else {
            commandManager = precommandOrCommandManager;
        }

        commandManager.register(name, this.pluginName, callback.bind(this), options);
    }

    protected _registerUnknownCommandHandler(commandManager: CommandManager, func: BotCommandCallback): void;
    protected _registerUnknownCommandHandler(precommand: PrecommandWithoutCallback, func: BotCommandCallback): void;

    protected _registerUnknownCommandHandler(precommandOrCommandManager: PrecommandWithoutCallback | CommandManager,
        func: BotCommandCallback): void {
        let commandManager: CommandManager;

        if (precommandOrCommandManager instanceof PrecommandWithoutCallback) {
            commandManager = precommandOrCommandManager.commandManager;
        } else {
            commandManager = precommandOrCommandManager;
        }

        commandManager.registerUnkownCommandHanlder(func.bind(this));
    }

    protected _registerPrecommand(precommand: string | string[]): PrecommandWithoutCallback;
    protected _registerPrecommand(precommand: string | string[],
        callback: PrecommandCallback): PrecommandWithCallback;

    /** Adds a handler function to a precommand */
    protected _registerPrecommand(precommand: string | string[], callback?: PrecommandCallback): Precommand {
        const precommandManager: PrecommandManager = this.bot.precommandManager;
        if (callback) {
            return precommandManager.createAndRegister(precommand, callback.bind(this));
        } else {
            return precommandManager.createAndRegister(precommand);
        }
    }

    protected _registerMessageHandler(func: (event: DiscordMessageEvent, eventControls: EventControls) => Generator<MessageOrAction> | AsyncGenerator<MessageOrAction>) {
        const actionRunner = new ActionRunner(this.bot);
        const boundFunc = func.bind(this);
        this.bot.events.message.addHandler(async (messageEvent, eventControls) => {
            await actionRunner.run(boundFunc(messageEvent, eventControls), messageEvent);
        });
    }
}

export default BotPlugin;