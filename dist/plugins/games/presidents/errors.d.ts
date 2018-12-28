declare class MessageSyntaxError extends Error {
    constructor(message?: string);
}
declare class MessageActionError extends Error {
    constructor(message?: string);
}
declare class DMAlreadyLockedError extends Error {
    constructor();
}
declare class AlreadyJoinedError extends Error {
    constructor();
}
export { MessageSyntaxError, MessageActionError, DMAlreadyLockedError, AlreadyJoinedError };
