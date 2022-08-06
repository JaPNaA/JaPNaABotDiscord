import Logger from "../../utils/logger";
import removeFromArray from "../../utils/removeFromArray";
import tryRun from "../../utils/tryRun";

export type EventHandler<T> = (data: T, eventControls: EventControls) => any;

export interface EventControls {
    /**
     * Prevents lower-priority handlers from running.
     * 
     * Currently only `stopPropagation` on high priority handlers have an effect.
     * (Prevents lowPriorityHandlers from running)
     */
    stopPropagation(): void;

    /**
     * Prevents system from processing event further.
     * 
     * For example, if preventNext is called on a `message` event,
     * a `command` will not be executed.
     * 
     * Calling preventNext on `send` prevents a message from being `sent`,
     * `beforeMemoryWrite` prevents a memory write, etc.
     */
    preventSystemNext(): void;
}

export class EventHandlers<T = void> {
    /**
     * Handlers called first
     */
    private highPriorityHandlers: EventHandler<T>[] = [];
    /**
     * Handlers called second.
     */
    private normalHandlers: EventHandler<T>[] = [];
    /**
     * System handlers, called third.
     * Not cancelled with `stopPropagation`, but cancelled by `preventSystemNext`.
     */
    private systemHandlers: EventHandler<T>[] = [];

    private shouldStopPropagation = false;
    private shouldPreventSystem = false;

    private eventControls: EventControls = {
        stopPropagation: () => this.shouldStopPropagation = true,
        preventSystemNext: () => this.shouldPreventSystem = true
    }

    public addHandler(handler: EventHandler<T>) {
        this.normalHandlers.push(handler);
    }

    public addHighPriorityHandler(handler: EventHandler<T>) {
        this.highPriorityHandlers.push(handler);
    }

    public _addSystemHandler(handler: EventHandler<T>) {
        this.systemHandlers.push(handler);
    }

    public removeHandler(handler: EventHandler<T>) {
        removeFromArray(this.normalHandlers, handler);
    }

    public removeHighPriorityHandler(handler: EventHandler<T>) {
        removeFromArray(this.highPriorityHandlers, handler);
    }

    public _removeSystemHandler(handler: EventHandler<T>) {
        removeFromArray(this.systemHandlers, handler);
    }

    public async dispatch(data: T): Promise<{ stoppedPropagation: boolean, preventedSystem: boolean }> {
        this.shouldStopPropagation = false;
        this.shouldPreventSystem = false;

        await this.runEventHandlerArr(this.highPriorityHandlers, data);

        if (!this.shouldStopPropagation) {
            await this.runEventHandlerArr(this.normalHandlers, data);
        }

        if (!this.shouldPreventSystem) {
            await this.runEventHandlerArr(this.systemHandlers, data);
        }

        return {
            stoppedPropagation: this.shouldStopPropagation,
            preventedSystem: this.shouldPreventSystem
        }
    }

    private async runEventHandlerArr(arr: EventHandler<T>[], data: T) {
        const errors: string[] = [];
        const promises: Promise<any>[] = [];

        Logger.log_message("Event: " + data);

        for (const handler of arr) {
            promises.push(tryRun(() => handler(data, this.eventControls))
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
