export declare type EventHandler<T> = (event: T) => any;
export declare class EventHandlers<T = void> {
    private highPriorityHandlers;
    private lowPriorityHandlers;
    addHandler(handler: EventHandler<T>): void;
    addHighPriorityHandler(handler: EventHandler<T>): void;
    removeHandler(handler: EventHandler<T>): void;
    removeHighPriorityHandler(handler: EventHandler<T>): void;
    dispatch(data: T): Promise<void>;
    private runEventHandlerArr;
}
