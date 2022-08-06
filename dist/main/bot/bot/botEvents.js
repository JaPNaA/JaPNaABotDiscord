"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventHandlers_js_1 = require("../events/eventHandlers.js");
class BotEvent {
    ready = new eventHandlers_js_1.EventHandlers();
    start = new eventHandlers_js_1.EventHandlers();
    stop = new eventHandlers_js_1.EventHandlers();
    message = new eventHandlers_js_1.EventHandlers();
    command = new eventHandlers_js_1.EventHandlers();
    send = new eventHandlers_js_1.EventHandlers();
    sendDM = new eventHandlers_js_1.EventHandlers();
    sent = new eventHandlers_js_1.EventHandlers();
    beforeMemoryWrite = new eventHandlers_js_1.EventHandlers();
    afterMemoryWrite = new eventHandlers_js_1.EventHandlers();
    addAsync = new eventHandlers_js_1.EventHandlers();
    doneAsync = new eventHandlers_js_1.EventHandlers();
    constructor(bot) { }
}
exports.default = BotEvent;
