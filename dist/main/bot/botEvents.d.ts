import BotHooks from "./botHooks.js";
import EventName from "./eventName.js";
declare type EventHandler = (botHooks: BotHooks, event: any) => void;
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
