import BotHooks from "./botHooks.js";
import EventName from "./eventName.js";

import { tryRun } from "../utils.js";
import Logger from "../logger.js";

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

    constructor(botHooks: BotHooks) {
        this.botHooks = botHooks;
    }

    on(name: EventName, func: Function): void {
        this.events[name].push(func);
    }

    dispatch(name: EventName, event: any): string[] {
        let errors: string[] = [];

        Logger.log_message("Event: " + name);

        for (let handler of this.events[name]) {
            let error: string | null = tryRun(() => handler(this.botHooks, event));

            if (error) {
                errors.push(error);
                Logger.warn(error);
            }
        }

        return errors;
    }
}

export default BotEvent;