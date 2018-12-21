import BotHooks from "./botHooks.js";
import EventName from "./eventName.js";
declare class BotEvent {
    events: {
        [x: string]: Function[];
    };
    botHooks: BotHooks;
    constructor(botHooks: BotHooks);
    on(name: EventName, func: Function): void;
    dispatch(name: EventName, event: any): string[];
}
export default BotEvent;
