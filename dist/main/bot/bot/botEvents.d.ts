import BotHooks from "./botHooks.js";
import EventName from "../types/eventName.js";
import EventHandler from "../types/eventHandler.js";
declare class BotEvent {
    events: {
        [x: string]: Function[];
    };
    botHooks: BotHooks;
    constructor(botHooks: BotHooks);
    on(name: EventName, func: EventHandler): void;
    dispatch(name: EventName, event: any): string[];
}
export default BotEvent;
