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
export declare class EventHandlers<T = void> {
    /**
     * Handlers called first
     */
    private highPriorityHandlers;
    /**
     * Handlers called second.
     */
    private normalHandlers;
    /**
     * System handlers, called third.
     * Not cancelled with `stopPropagation`, but cancelled by `preventSystemNext`.
     */
    private systemHandlers;
    /**
     * Adds a system-level handler, removed after the promise resolves
     */
    promise(): Promise<void>;
    addHandler(handler: EventHandler<T>): void;
    addHighPriorityHandler(handler: EventHandler<T>): void;
    _addSystemHandler(handler: EventHandler<T>): void;
    removeHandler(handler: EventHandler<T>): void;
    removeHighPriorityHandler(handler: EventHandler<T>): void;
    _removeSystemHandler(handler: EventHandler<T>): void;
    dispatch(data: T): Promise<{
        stoppedPropagation: boolean;
        preventedSystem: boolean;
    }>;
    private runEventHandlerArr;
}
