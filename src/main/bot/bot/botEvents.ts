import EventName from "../types/eventName.js";

import tryRun from "../../utils/tryRun";
import Logger from "../../utils/logger.js";
import EventHandler from "../types/eventHandler.js";
import Bot from "./bot.js";

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

    constructor(private bot: Bot) { }

    on(name: EventName, func: EventHandler): void {
        this.events[name].push(func);
    }

    dispatch(name: EventName, event: any): string[] {
        let errors: string[] = [];

        Logger.log_message("Event: " + name);

        for (let handler of this.events[name]) {
            let error: string | null = tryRun(() => handler(this.bot, event));

            if (error) {
                errors.push(error);
                Logger.warn(error);
            }
        }

        return errors;
    }
}

export default BotEvent;