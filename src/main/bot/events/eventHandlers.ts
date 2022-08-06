import Logger from "../../utils/logger";
import removeFromArray from "../../utils/removeFromArray";
import tryRun from "../../utils/tryRun";

export type EventHandler<T> = (event: T) => any;

export class EventHandlers<T = void> {
    private highPriorityHandlers: EventHandler<T>[] = [];
    private lowPriorityHandlers: EventHandler<T>[] = [];

    public addHandler(handler: EventHandler<T>) {
        this.lowPriorityHandlers.push(handler);
    }

    public addHighPriorityHandler(handler: EventHandler<T>) {
        this.highPriorityHandlers.push(handler);
    }

    public removeHandler(handler: EventHandler<T>) {
        removeFromArray(this.lowPriorityHandlers, handler);
    }

    public removeHighPriorityHandler(handler: EventHandler<T>) {
        removeFromArray(this.highPriorityHandlers, handler);
    }

    public async dispatch(data: T) {
        await this.runEventHandlerArr(this.highPriorityHandlers, data);
        await this.runEventHandlerArr(this.lowPriorityHandlers, data);
    }

    private async runEventHandlerArr(arr: EventHandler<T>[], data: T) {
        const errors: string[] = [];
        const promises: Promise<any>[] = [];

        Logger.log_message("Event: " + data);

        for (const handler of arr) {
            promises.push(tryRun(() => handler(data))
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
