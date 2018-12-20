import BotHooks from "./botHooks.js";
import events from "../events.js";

/**
 * @typedef {import("./botHooks.js")} BotHooks
 * @typedef {"ready" | "start" | "stop" | "message" | "command" | "send" | "senddm" | "sent" | "beforememorywrite" | "aftermemorywrite" | "addasync" | "doneasync"} EventName
 */

const { tryRun } = require("../utils.js");
const Logger = require("../logger.js");

class BotEvent {
    events: { [x: string]: Function[] } = {
        "ready": [],
        "start": [],
        "stop": [],

        "message": [],
        "command": [],

        "send": [],
        "senddm": [],
        "sent": [],

        "beforememorywrite": [],
        "aftermemorywrite": [],

        "addasync": [],
        "doneasync": []
    };
    botHooks: BotHooks;

    /**
     * @param {BotHooks} botHooks 
     */
    constructor(botHooks: BotHooks) {
        this.botHooks = botHooks;
    }

    // TODO: Verify this
    on(name: "ready", func: (nul: null) => any): void;
    on(name: "start", func: (nul: null) => any): void;
    on(name: "stop", func: (nul: null) => any): void;
    on(name: "message", func: (bot: Bot, event: events.DiscordMessageEvent) => any): void;
    on(name: "command", func: (bot: Bot, event: events.DiscordCommandEvent) => any): void;
    on(name: "send", func: (Bot: Bot) => any): void;
    on(name: "senddm", func: (nul: null) => any): void;
    on(name: "sent", func: (nul: null) => any): void;
    on(name: "beforememorywrite", func: (nul: null) => any): void;
    on(name: "aftermemorywrite", func: (nul: null) => any): void;
    on(name: "addasync", func: (nul: null) => any): void;
    on(name: "doneasync", func: (nul: null) => any): void;
    on(name: string, func: Function): void {
        this.events[name].push(func);
    }

    // TODO: Verify this
    dispatch(name: "ready", event: null): void;
    dispatch(name: "start", event: null): void;
    dispatch(name: "stop", event: null): void;
    dispatch(name: "message", event: events.DiscordMessageEvent): void;
    dispatch(name: "command", event: events.DiscordCommandEvent): void;
    dispatch(name: "send", event: any): void;
    dispatch(name: "senddm", event: any): void;
    dispatch(name: "sent", event: any): void;
    dispatch(name: "beforememorywrite", event: any): void;
    dispatch(name: "aftermemorywrite", event: any): void;
    dispatch(name: "addasync", event: any): void;
    dispatch(name: "doneasync", event: any): void;
    dispatch(name: string, event: any): string[] {
        /** @type {String[]} */
        let errors: string[] = [];

        for (let handler of this.events[name]) {
            let error = tryRun(() => handler(this.botHooks, event));

            if (error) {
                errors.push(error);
                Logger.warn(error);
            }
        }

        return errors;
    }
}

module.exports = BotEvent;