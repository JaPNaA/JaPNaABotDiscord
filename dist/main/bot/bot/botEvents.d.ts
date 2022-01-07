import EventName from "../types/eventName.js";
import EventHandler from "../types/eventHandler.js";
import Bot from "./bot.js";
declare class BotEvent {
    private bot;
    events: {
        [x: string]: EventHandler[];
    };
    constructor(bot: Bot);
    on(name: EventName, func: EventHandler): void;
    dispatch(name: EventName, event: any): string[];
}
export default BotEvent;
