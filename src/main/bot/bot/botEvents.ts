import EventName from "../types/eventName.js";

import tryRun from "../../utils/tryRun";
import Logger from "../../utils/logger.js";
import EventHandler from "../types/eventHandler.js";
import Bot from "./bot.js";

class BotEvent {
    events: { [x: string]: EventHandler[] } = {
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

    async dispatch(name: EventName, event: any): Promise<string[]> {
        const errors: string[] = [];
        const promises: Promise<any>[] = [];

        Logger.log_message("Event: " + name);

        for (let handler of this.events[name]) {
            promises.push(tryRun(() => handler(event))
                .then(error => {
                    if (error) {
                        errors.push(error);
                        Logger.warn(error);
                    }
                }));
        }

        await Promise.all(promises);

        return errors;
    }
}

export default BotEvent;