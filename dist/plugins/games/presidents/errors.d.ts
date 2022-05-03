declare class MessageSyntaxError extends Error {
    constructor(message?: string);
}
declare class MessageActionError extends Error {
    constructor(message?: string);
}
export { MessageActionError, MessageSyntaxError };
