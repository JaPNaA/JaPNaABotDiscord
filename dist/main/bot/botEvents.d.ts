import BotHooks from "./botHooks.js";
import EventName from "./eventName.js";
import EventHandler from "./eventHandler.js";
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
