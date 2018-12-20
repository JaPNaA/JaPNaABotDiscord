/**
 * @typedef {import("./botHooks.js")} BotHooks
 * @typedef {"ready" | "start" | "stop" | "message" | "command" | "send" | "senddm" | "sent" | "beforememorywrite" | "aftermemorywrite" | "addasync" | "doneasync"} EventName
 */
declare const tryRun: any;
declare const Logger: any;
declare class BotEvent {
    /**
     * @param {BotHooks} botHooks
     */
    constructor(botHooks: any);
    /**
     * Adds event listener
     * @param {EventName} name name of event
     * @param {Function} func handler/callback function
     */
    on(name: any, func: any): void;
    /**
     * Call all event handlers for event
     * @param {EventName} name of event
     * @param {*} event Event data sent with dispatch
     * @returns {String[]} errors that have occured, can be empty
     */
    dispatch(name: any, event: any): {};
}
